<script>
import { useAuthStore } from '../stores/auth.js';
import { isPasswordValid } from '../utils/password.js';
import PasswordInput from './PasswordInput.vue';
import PasswordStrength from './PasswordStrength.vue';

export default {
  name: 'ResetPasswordModal',
  components: { PasswordInput, PasswordStrength },
  setup() {
    const auth = useAuthStore();
    return { auth };
  },
  data() {
    return {
      newPassword: '',
      confirmPassword: '',
      error: '',
      success: false,
      loading: false,
      // Mostra le regole solo dopo che l'utente ha iniziato a digitare
      passwordTouched: false,
      confirmTouched: false,
    };
  },
  computed: {
    passwordValid() {
      return isPasswordValid(this.newPassword);
    },
    confirmMismatch() {
      return this.confirmTouched && this.confirmPassword.length > 0 && this.newPassword !== this.confirmPassword;
    },
    canSubmit() {
      return this.passwordValid && this.newPassword === this.confirmPassword && !this.loading;
    },
  },
  methods: {
    onPasswordInput(val) {
      this.newPassword = val;
      this.passwordTouched = true;
      this.error = '';
    },
    onConfirmInput(val) {
      this.confirmPassword = val;
      this.confirmTouched = true;
      this.error = '';
    },
    async submit() {
      this.error = '';
      if (!this.passwordValid) {
        this.error = 'La password non soddisfa tutti i requisiti.';
        return;
      }
      if (this.newPassword !== this.confirmPassword) {
        this.error = 'Le password non coincidono.';
        return;
      }
      this.loading = true;
      try {
        await this.auth.completePasswordReset(this.newPassword);
        this.success = true;
        // L'overlay si chiuderà automaticamente perché auth.isRecovering diventa false
      } catch (err) {
        this.error = err?.message || 'Errore durante l\'aggiornamento della password.';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<template>
  <!-- Overlay NON chiudibile: l'utente deve impostare la nuova password -->
  <div class="reset-overlay">
    <div class="reset-card">
      <!-- Logo -->
      <div class="reset-logo">
        <img src="/public/img/logo-myflix.png" alt="MyFlix" class="reset-logo-img" />
      </div>

      <div class="reset-icon">
        <i class="fa-solid fa-lock-open"></i>
      </div>

      <h2 class="reset-title">Imposta la nuova password</h2>
      <p class="reset-subtitle">
        Sei connesso come <strong class="reset-email">{{ auth.email }}</strong>.
        Scegli una nuova password sicura per completare l'accesso.
      </p>

      <form @submit.prevent="submit" novalidate>
        <!-- Nuova password -->
        <div class="field-group">
          <label for="new-pw">Nuova password</label>
          <PasswordInput
            id="new-pw"
            :model-value="newPassword"
            @update:model-value="onPasswordInput"
            placeholder="Almeno 8 caratteri"
            autocomplete="new-password"
            required
          />
          <!-- Indicatore forza + checklist (appare appena l'utente inizia a digitare) -->
          <PasswordStrength v-if="passwordTouched && newPassword.length > 0" :password="newPassword" />
        </div>

        <!-- Conferma password -->
        <div class="field-group">
          <label for="confirm-pw">Conferma password</label>
          <PasswordInput
            id="confirm-pw"
            :model-value="confirmPassword"
            @update:model-value="onConfirmInput"
            placeholder="Ripeti la password"
            autocomplete="new-password"
            required
          />
          <p v-if="confirmMismatch" class="field-error">
            <i class="fa-solid fa-triangle-exclamation"></i> Le password non coincidono.
          </p>
        </div>

        <p v-if="error" class="form-error">{{ error }}</p>

        <button
          type="submit"
          class="reset-submit"
          :disabled="!canSubmit"
          :class="{ ready: canSubmit }"
        >
          <span v-if="loading" class="spinner"></span>
          <i v-else class="fa-solid fa-shield-halved"></i>
          {{ loading ? 'Salvataggio…' : 'Salva nuova password' }}
        </button>
      </form>

      <p class="reset-note">
        <i class="fa-solid fa-circle-info"></i>
        Non puoi accedere all'app finché non hai impostato una nuova password.
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;

.reset-overlay {
  position: fixed;
  inset: 0;
  z-index: $z-auth + 100; // sopra tutto, inclusa la bottom-nav e ogni altra modale
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(6px);
  padding: $space-md;
}

.reset-card {
  width: 100%;
  max-width: 440px;
  max-height: 92vh;
  overflow-y: auto;
  background-color: #141414;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: $radius-md;
  padding: 36px 28px 28px;
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.8);
  color: $color-text;

  // Scrollbar sottile
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.2) transparent;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
}

.reset-logo {
  text-align: center;
  margin-bottom: $space-md;
}

.reset-logo-img {
  height: 26px;
  width: auto;
}

.reset-icon {
  text-align: center;
  font-size: 2.2rem;
  color: $color-accent;
  margin-bottom: $space-sm;
}

.reset-title {
  font-size: 1.35rem;
  font-weight: 700;
  text-align: center;
  margin: 0 0 $space-sm;
}

.reset-subtitle {
  font-size: 0.88rem;
  color: $color-text-muted;
  text-align: center;
  margin-bottom: $space-lg;
  line-height: 1.5;
}

.reset-email {
  color: $color-text;
  word-break: break-all;
}

// Campi
.field-group {
  margin-bottom: $space-md;

  label {
    display: block;
    font-size: 0.82rem;
    color: $color-text-muted;
    margin-bottom: 6px;
    font-weight: 500;
  }
}

.field-error {
  color: #ff6b6b;
  font-size: 0.78rem;
  margin: 5px 0 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

.form-error {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-bottom: $space-sm;
  background: rgba(255, 107, 107, 0.08);
  border-left: 3px solid #ff6b6b;
  padding: 8px 10px;
  border-radius: 0 $radius-sm $radius-sm 0;
}

// Pulsante submit
.reset-submit {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  color: $color-text-dim;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: $radius-sm;
  padding: 13px;
  font-size: 1rem;
  font-weight: 700;
  cursor: not-allowed;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  margin-top: $space-sm;

  // Diventa rosso/attivo solo quando tutte le regole sono soddisfatte
  &.ready {
    background-color: $color-accent;
    color: $color-text;
    border-color: $color-accent;
    cursor: pointer;

    &:hover:not(:disabled) {
      opacity: 0.88;
    }
  }

  &:disabled:not(.ready) {
    opacity: 0.6;
  }
}

// Spinner
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: $color-text;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// Nota informativa in fondo
.reset-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.78rem;
  color: $color-text-dim;
  margin-top: $space-lg;
  line-height: 1.4;

  i {
    margin-top: 1px;
    flex-shrink: 0;
    color: #6495ed;
  }
}
</style>
