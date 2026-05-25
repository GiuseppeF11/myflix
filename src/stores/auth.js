import { defineStore } from 'pinia';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';
import { useFavoritesStore } from './favorites.js';

const AVATAR_PREFIX   = 'myflix:avatar:';
const RECOVERY_KEY    = 'myflix:recovery'; // sessionStorage flag per il reset forzato

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,
    ready: false,
    avatarUrl: null,
    isRecovering: false, // true = utente arrivato via link di reset, DEVE impostare nuova password
  }),
  getters: {
    isLoggedIn:  (state) => !!state.user,
    email:       (state) => state.user?.email ?? '',
    avatarKey:   (state) => `${AVATAR_PREFIX}${state.user?.id || 'guest'}`,
  },
  actions: {
    async init() {
      if (!isSupabaseConfigured) {
        this.loadAvatar();
        this.ready = true;
        return;
      }

      // Controlla se il tab era in recovery mode prima di un eventuale refresh
      if (sessionStorage.getItem(RECOVERY_KEY) === '1') {
        this.isRecovering = true;
      }

      const { data } = await supabase.auth.getSession();
      this.session = data.session;
      this.user    = data.session?.user ?? null;
      this.loadAvatar();

      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          // L'utente ha cliccato il link di reset dalla email.
          // Lo blocchiamo nell'app finché non imposta la nuova password.
          this.session     = session;
          this.user        = session?.user ?? null;
          this.isRecovering = true;
          sessionStorage.setItem(RECOVERY_KEY, '1');
          return;
        }

        this.session     = session;
        this.user        = session?.user ?? null;
        // Se l'evento non è PASSWORD_RECOVERY e non stavamo già recuperando,
        // rimuoviamo il flag di recovery (es. login normale dopo scadenza token).
        if (event !== 'PASSWORD_RECOVERY') {
          this.isRecovering = false;
          sessionStorage.removeItem(RECOVERY_KEY);
        }
        this.loadAvatar();
      });

      this.ready = true;
    },

    async signUp(email, password) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return data;
    },

    async signIn(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      this.user    = data.user;
      this.session = data.session;
      await useFavoritesStore().mergeLocalIntoRemote();
      this.loadAvatar();
      return data;
    },

    async signOut() {
      if (isSupabaseConfigured) await supabase.auth.signOut();
      this.user        = null;
      this.session     = null;
      this.isRecovering = false;
      sessionStorage.removeItem(RECOVERY_KEY);
      useFavoritesStore().loadLocal();
      this.loadAvatar();
    },

    /**
     * Completamento del reset forzato: imposta la nuova password e sblocca l'app.
     * Chiamata dalla ResetPasswordModal dopo che l'utente ha compilato il form.
     */
    async completePasswordReset(newPassword) {
      if (!isSupabaseConfigured) throw new Error('Autenticazione non configurata.');
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      // Reset completato: l'utente è ora loggato normalmente
      this.isRecovering = false;
      sessionStorage.removeItem(RECOVERY_KEY);
      await useFavoritesStore().load();
      this.loadAvatar();
    },

    /** Cambio password da profilo (utente già loggato). */
    async changePassword(newPassword) {
      if (!isSupabaseConfigured) throw new Error('Autenticazione non configurata.');
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },

    /** Invio email di reset password. */
    async resetPassword(email) {
      if (!isSupabaseConfigured) throw new Error('Autenticazione non configurata.');
      // Il link nell'email porta l'utente su /reset-password (pagina dedicata, senza header/nav).
      const redirectTo = window.location.origin + '/reset-password';
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
    },

    // ---- Avatar ----
    loadAvatar() {
      this.avatarUrl = localStorage.getItem(this.avatarKey);
    },
    setAvatar(dataUrl) {
      localStorage.setItem(this.avatarKey, dataUrl);
      this.avatarUrl = dataUrl;
    },
    removeAvatar() {
      localStorage.removeItem(this.avatarKey);
      this.avatarUrl = null;
    },
  },
});
