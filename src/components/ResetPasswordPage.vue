<script>
import { useAuthStore } from '../stores/auth.js';
import { isPasswordValid } from '../utils/password.js';
import PasswordInput from './PasswordInput.vue';
import PasswordStrength from './PasswordStrength.vue';
import PageLoader from './PageLoader.vue';
import AppLogo from './AppLogo.vue';

export default {
  name: 'ResetPasswordPage',
  components: { PasswordInput, PasswordStrength, PageLoader, AppLogo },
  setup() {
    const auth = useAuthStore();
    return { auth };
  },
  data() {
    return {
      newPassword: '',
      confirmPassword: '',
      passwordTouched: false,
      confirmTouched: false,
      error: '',
      loading: false,
      done: false,
    };
  },
  computed: {
    passwordOk() {
      return isPasswordValid(this.newPassword);
    },
    mismatch() {
      return this.confirmTouched && this.confirmPassword.length > 0
        && this.newPassword !== this.confirmPassword;
    },
    canSubmit() {
      return this.passwordOk && this.newPassword === this.confirmPassword && !this.loading;
    },
  },
  methods: {
    onNewPw(val)  { this.newPassword = val;     this.passwordTouched = true; this.error = ''; },
    onConfirm(val){ this.confirmPassword = val; this.confirmTouched  = true; this.error = ''; },

    async submit() {
      if (!this.canSubmit) return;
      this.error = '';
      this.loading = true;
      try {
        await this.auth.completePasswordReset(this.newPassword);
        this.done = true;
        // Piccola pausa per far leggere il messaggio di successo, poi vai alla home
        setTimeout(() => this.$router.push('/'), 2200);
      } catch (err) {
        this.error = err?.message || 'Errore durante l\'aggiornamento della password.';
      } finally {
        this.loading = false;
      }
    },

    goHome() {
      this.$router.push('/');
    },
  },
};
</script>

<template>
  <div class="rp-page">
    <div class="rp-card">

      <!-- Logo -->
      <router-link to="/" class="rp-logo-link">
        <AppLogo />
      </router-link>

      <!-- ── Caricamento in corso ── -->
      <PageLoader :visible="!auth.ready" />

      <!-- Contenuto visibile solo quando auth è pronto -->
      <template v-if="auth.ready">

      <!-- ── Completato con successo ── -->
      <div v-if="done" class="rp-state rp-success">
        <i class="fa-solid fa-circle-check rp-state-icon"></i>
        <h2>Password aggiornata!</h2>
        <p>Stai per essere reindirizzato alla home…</p>
      </div>

      <!-- ── Link non valido / scaduto ── -->
      <div v-else-if="!auth.isRecovering" class="rp-state rp-invalid">
        <i class="fa-solid fa-triangle-exclamation rp-state-icon"></i>
        <h2>Link non valido o scaduto</h2>
        <p>Richiedi un nuovo link di recupero password dalla pagina di accesso.</p>
        <button class="rp-btn-home" @click="goHome">Torna alla home</button>
      </div>

      <!-- ── Form reset password ── -->
      <template v-else>
        <div class="rp-header">
          <i class="fa-solid fa-lock-open rp-header-icon"></i>
          <h1 class="rp-title">Imposta nuova password</h1>
          <p class="rp-subtitle">
            Account: <strong class="rp-email">{{ auth.email }}</strong>
          </p>
        </div>

        <form class="rp-form" @submit.prevent="submit" novalidate>

          <!-- Nuova password -->
          <div class="rp-field">
            <label for="rp-new">Nuova password</label>
            <PasswordInput
              id="rp-new"
              :model-value="newPassword"
              @update:model-value="onNewPw"
              placeholder="Almeno 8 caratteri"
              autocomplete="new-password"
              required
            />
            <PasswordStrength
              v-if="passwordTouched && newPassword.length > 0"
              :password="newPassword"
            />
          </div>

          <!-- Conferma password -->
          <div class="rp-field">
            <label for="rp-confirm">Conferma password</label>
            <PasswordInput
              id="rp-confirm"
              :model-value="confirmPassword"
              @update:model-value="onConfirm"
              placeholder="Ripeti la password"
              autocomplete="new-password"
              required
            />
            <p v-if="mismatch" class="rp-field-error">
              <i class="fa-solid fa-triangle-exclamation"></i> Le password non coincidono.
            </p>
          </div>

          <p v-if="error" class="rp-error">{{ error }}</p>

          <button
            type="submit"
            class="rp-submit"
            :class="{ ready: canSubmit }"
            :disabled="!canSubmit"
          >
            <span v-if="loading" class="rp-spinner"></span>
            <i v-else class="fa-solid fa-shield-halved"></i>
            {{ loading ? 'Salvataggio…' : 'Salva nuova password' }}
          </button>
        </form>
      </template><!-- fine form reset -->

      </template><!-- fine v-if="auth.ready" -->

    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;
@use '../assets/scss/partials/mixins' as *;

// ── Sfondo piena schermata ──
.rp-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $space-md;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(219, 25, 39, 0.08) 0%, transparent 55%),
    $color-bg;
}

// ── Card centrale ──
.rp-card {
  width: 100%;
  max-width: 440px;
  background-color: #141414;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: $radius-md;
  padding: 40px 32px 36px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.75);
}

// ── Logo ──
.rp-logo-link {
  display: flex;
  justify-content: center;
  margin-bottom: $space-lg;
}

.rp-logo {
  height: 30px;
  width: auto;
}

// ── Header del form ──
.rp-header {
  text-align: center;
  margin-bottom: $space-lg;
}

.rp-header-icon {
  font-size: 2.4rem;
  color: $color-accent;
  display: block;
  margin-bottom: $space-sm;
}

.rp-title {
  font-size: clamp(1.3rem, 3vw, 1.6rem);
  font-weight: 700;
  margin: 0 0 $space-sm;
}

.rp-subtitle {
  font-size: 0.88rem;
  color: $color-text-muted;
  margin: 0;
}

.rp-email {
  color: $color-text;
  word-break: break-all;
}

// ── Campi ──
.rp-form {
  display: flex;
  flex-direction: column;
  gap: $space-md;
}

.rp-field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.82rem;
    color: $color-text-muted;
    font-weight: 500;
  }
}

.rp-field-error {
  color: #ff6b6b;
  font-size: 0.78rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 5px;

  i { font-size: 0.72rem; }
}

.rp-error {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin: 0;
  background: rgba(255, 107, 107, 0.08);
  border-left: 3px solid #ff6b6b;
  padding: 8px 12px;
  border-radius: 0 $radius-sm $radius-sm 0;
}

// ── Pulsante submit ──
.rp-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: $radius-sm;
  background-color: rgba(255, 255, 255, 0.07);
  color: $color-text-dim;
  font-size: 1rem;
  font-weight: 700;
  cursor: not-allowed;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, opacity 0.15s ease;
  margin-top: $space-sm;

  // Si attiva (rosso) solo quando tutte le regole sono soddisfatte
  &.ready {
    background-color: $color-accent;
    border-color: $color-accent;
    color: $color-text;
    cursor: pointer;

    &:hover { opacity: 0.88; }
  }
}

// ── Stati (loading / success / invalid) ──
.rp-state {
  text-align: center;
  padding: $space-lg 0;

  p {
    color: $color-text-muted;
    margin: $space-sm 0 0;
    font-size: 0.95rem;
  }

  h2 {
    font-size: 1.3rem;
    font-weight: 700;
    margin: $space-sm 0 $space-sm;
  }
}

.rp-state-icon {
  font-size: 2.8rem;
  display: block;
  margin-bottom: $space-sm;
}

.rp-success .rp-state-icon { color: #43a047; }
.rp-invalid .rp-state-icon { color: #fb8c00; }

.rp-btn-home {
  margin-top: $space-md;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: $color-accent;
  color: $color-text;
  border: none;
  border-radius: $radius-sm;
  padding: 10px 24px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover { opacity: 0.88; }
}

// ── Spinner inline (usato nel bottone submit) ──
.rp-spinner {
  @include spinner(16px);
}

@media (max-width: $bp-md) {
  .rp-card {
    padding: 32px 20px 28px;
  }
}
</style>
