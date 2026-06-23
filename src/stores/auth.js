import { defineStore } from 'pinia';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';
import { useFavoritesStore } from './favorites.js';

const AVATAR_PREFIX   = 'cinova:avatar:';
const RECOVERY_KEY    = 'cinova:recovery'; // sessionStorage flag per il reset forzato

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
    firstName:   (state) => state.user?.user_metadata?.first_name ?? '',
    lastName:    (state) => state.user?.user_metadata?.last_name ?? '',
    fullName:    (state) => {
      const f = state.user?.user_metadata?.first_name ?? '';
      const l = state.user?.user_metadata?.last_name  ?? '';
      return (f + ' ' + l).trim();
    },
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

    async signUp(email, password, { firstName, lastName } = {}) {
      const meta = {};
      if (firstName) meta.first_name = firstName;
      if (lastName)  meta.last_name  = lastName;
      const opts = Object.keys(meta).length ? { data: meta } : {};
      const { data, error } = await supabase.auth.signUp({ email, password, options: opts });

      // Supabase può segnalare email duplicata in due modi diversi a seconda della
      // configurazione (email confirmation ON/OFF) e dell'ambiente (locale vs hosted):
      //
      // A) Email confirmation OFF (tipico in locale): lancia un AuthApiError
      //    con status 422 e messaggio "User already registered".
      // B) Email confirmation ON (hosted default): non lancia errore ma restituisce
      //    un utente con identities vuote.
      //
      // In entrambi i casi convertiamo in un errore generico con code DUPLICATE_EMAIL
      // per non rivelare l'esistenza dell'email nel sistema.

      if (error) {
        const isDuplicate =
          error.status === 422 ||
          /already registered|already in use|email.*exists/i.test(error.message ?? '');
        if (isDuplicate) {
          const e = new Error('Registrazione non riuscita. Verifica i dati inseriti e riprova.');
          e.code  = 'DUPLICATE_EMAIL';
          throw e;
        }
        throw error;
      }

      // Caso B: nessun errore Supabase ma identities vuote (o null/assenti).
      // Supabase invia comunque una email di notifica all'utente esistente (by design),
      // ma non crea un nuovo account. Noi mostriamo un errore generico in UI.
      const identities = data.user?.identities;
      if (!data.session && (!identities || identities.length === 0)) {
        const e = new Error('Registrazione non riuscita. Verifica i dati inseriti e riprova.');
        e.code  = 'DUPLICATE_EMAIL';
        throw e;
      }

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

    /**
     * Verifica che la password attuale sia corretta eseguendo un login silenzioso.
     * Ritorna true se corretta, false se sbagliata, lancia errore per problemi di rete.
     */
    async verifyPassword(password) {
      if (!isSupabaseConfigured) throw new Error('Autenticazione non configurata.');
      const { error } = await supabase.auth.signInWithPassword({
        email: this.email,
        password,
      });
      return !error;
    },

    /**
     * Aggiorna nome, cognome, email e/o password del profilo utente.
     * Passa solo i campi che sono stati modificati.
     */
    async updateProfile({ firstName, lastName, email, newPassword } = {}) {
      if (!isSupabaseConfigured) throw new Error('Autenticazione non configurata.');
      const payload = {};
      if (email && email !== this.email) payload.email = email;
      if (newPassword) payload.password = newPassword;
      const meta = {};
      if (firstName !== undefined) meta.first_name = firstName;
      if (lastName  !== undefined) meta.last_name  = lastName;
      if (Object.keys(meta).length) payload.data = meta;
      if (!Object.keys(payload).length) return; // nulla da aggiornare
      const { data, error } = await supabase.auth.updateUser(payload);
      if (error) throw error;
      if (data?.user) this.user = data.user;
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
