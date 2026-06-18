<script>
import { useAuthStore } from '../stores/auth.js';
import { isSupabaseConfigured } from '../services/supabase.js';
import { isPasswordValid, isEmailValid } from '../utils/password.js';
import PasswordInput from './PasswordInput.vue';
import PasswordStrength from './PasswordStrength.vue';

export default {
  name: 'AuthModal',
  components: { PasswordInput, PasswordStrength },
  emits: ['close'],
  props: {
    initialMode: { type: String, default: 'login' }, // 'login' | 'signup' | 'reset'
  },
  setup() {
    const auth = useAuthStore();
    return { auth, supabaseEnabled: isSupabaseConfigured };
  },
  data() {
    return {
      mode: this.initialMode,
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      passwordTouched: false,
      error: '',
      info: '',
      loading: false,
    };
  },
  computed: {
    isLogin()  { return this.mode === 'login';  },
    isSignup() { return this.mode === 'signup'; },
    isReset()  { return this.mode === 'reset';  },
    title() {
      if (this.isLogin)  return 'Accedi';
      if (this.isSignup) return 'Registrati';
      return 'Recupera password';
    },
    // Validazione attiva solo in signup
    passwordOk() {
      return this.isSignup ? isPasswordValid(this.password) : true;
    },
    emailOk() {
      return isEmailValid(this.email);
    },
  },
  methods: {
    switchMode(mode) {
      this.mode = mode;
      this.error = '';
      this.info  = '';
      this.passwordTouched = false;
      this.firstName = '';
      this.lastName  = '';
    },
    onPasswordInput(val) {
      this.password = val;
      this.passwordTouched = true;
    },
    async submit() {
      this.error = '';
      this.info  = '';

      // ── Validazioni client-side ───────────────────────────────────────────
      if (!this.emailOk) {
        this.error = 'Inserisci un indirizzo email valido.';
        return;
      }
      if (this.isSignup && !this.passwordOk) {
        this.error = 'La password non soddisfa tutti i requisiti richiesti.';
        return;
      }

      this.loading = true;
      try {
        if (this.isReset) {
          await this.auth.resetPassword(this.email);
          this.info = 'Email inviata! Controlla la tua casella e clicca il link per reimpostare la password.';
        } else if (this.isLogin) {
          await this.auth.signIn(this.email, this.password);
          this.$emit('close');
        } else {
          const data = await this.auth.signUp(this.email, this.password, {
            firstName: this.firstName,
            lastName:  this.lastName,
          });
          if (data.session) {
            await this.auth.signIn(this.email, this.password);
            this.$emit('close');
          } else {
            this.info = 'Registrazione completata. Controlla la tua email per confermare l\'account, poi accedi.';
            this.mode = 'login';
          }
        }
      } catch (err) {
        // DUPLICATE_EMAIL: l'errore è intenzionalmente generico per non rivelare
        // se quella email è già registrata nel sistema (sicurezza anti-enumeration).
        if (err?.code === 'DUPLICATE_EMAIL') {
          this.error = 'Registrazione non riuscita. Verifica i dati inseriti e riprova.';
        } else {
          this.error = err?.message || 'Si è verificato un errore. Riprova più tardi.';
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<template>
  <div class="auth-overlay" @click.self="$emit('close')">
    <div class="auth-card">
      <button class="close-btn" @click="$emit('close')" aria-label="Chiudi">&times;</button>

      <!-- Logo -->
      <div class="auth-logo">
        <img src="/img/logo-myflix.png" alt="MyFlix" class="auth-logo-img" />
      </div>

      <h3 class="auth-title">{{ title }}</h3>

      <!-- Descrizione per il recupero password -->
      <p v-if="isReset" class="auth-description">
        Inserisci l'email del tuo account e ti invieremo un link per reimpostare la password.
      </p>

      <form @submit.prevent="submit" novalidate>
        <!-- Nome + Cognome (solo signup) -->
        <div v-if="isSignup" class="field-row-2">
          <div class="field-group">
            <label for="auth-firstname">Nome</label>
            <input
              id="auth-firstname"
              v-model="firstName"
              type="text"
              autocomplete="given-name"
              placeholder="Mario"
              class="text-input"
            />
          </div>
          <div class="field-group">
            <label for="auth-lastname">Cognome</label>
            <input
              id="auth-lastname"
              v-model="lastName"
              type="text"
              autocomplete="family-name"
              placeholder="Rossi"
              class="text-input"
            />
          </div>
        </div>

        <!-- Email -->
        <div class="field-group">
          <label for="auth-email">Email</label>
          <input
            id="auth-email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="nome@esempio.it"
            class="text-input"
          />
        </div>

        <!-- Password (nascosta in modalità reset) -->
        <div v-if="!isReset" class="field-group">
          <div class="field-label-row">
            <label for="auth-password">Password</label>
            <button
              v-if="isLogin && supabaseEnabled"
              type="button"
              class="forgot-link"
              @click="switchMode('reset')"
            >
              Hai dimenticato la password?
            </button>
          </div>

          <PasswordInput
            id="auth-password"
            :model-value="password"
            @update:model-value="onPasswordInput"
            :placeholder="isSignup ? 'Almeno 8 caratteri' : 'La tua password'"
            :autocomplete="isLogin ? 'current-password' : 'new-password'"
            required
          />

          <!-- Indicatore forza + regole (solo signup, mentre si digita) -->
          <PasswordStrength
            v-if="isSignup && passwordTouched && password.length > 0"
            :password="password"
          />
        </div>

        <p v-if="error" class="auth-error">{{ error }}</p>
        <p v-if="info"  class="auth-info">{{ info }}</p>

        <button
          type="submit"
          class="auth-submit"
          :disabled="loading || (isSignup && passwordTouched && !passwordOk)"
        >
          <span v-if="loading" class="spinner"></span>
          <span>{{ loading ? 'Attendere…' : title }}</span>
        </button>
      </form>

      <!-- Footer navigazione tra modi -->
      <div class="auth-footer">
        <template v-if="isLogin">
          <span>Non hai un account?</span>
          <button type="button" class="switch-btn" @click="switchMode('signup')">Registrati</button>
        </template>
        <template v-else-if="isSignup">
          <span>Hai già un account?</span>
          <button type="button" class="switch-btn" @click="switchMode('login')">Accedi</button>
        </template>
        <template v-else-if="isReset">
          <button type="button" class="switch-btn back-link" @click="switchMode('login')">
            <i class="fa-solid fa-arrow-left"></i> Torna al login
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;
@use '../assets/scss/partials/mixins' as *;

.auth-overlay {
  position: fixed;
  inset: 0;
  z-index: $z-auth;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
}

.auth-card {
  position: relative;
  width: 92%;
  max-width: 400px;
  max-height: 92vh;
  overflow-y: auto;
  background-color: #141414;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: $radius-md;
  padding: 36px 28px 28px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7);
  color: $color-text;

  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.2) transparent;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  color: $color-text-dim;
  transition: color 0.15s ease;
  padding: 0;
  &:hover { color: $color-text; }
}

.field-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-sm;
  margin-bottom: 0;
}

.auth-logo {
  text-align: center;
  margin-bottom: $space-md;
}

.auth-logo-img {
  height: 28px;
  width: auto;
}

.auth-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 $space-md;
  text-align: center;
}

.auth-description {
  font-size: 0.88rem;
  color: $color-text-muted;
  text-align: center;
  margin-bottom: $space-md;
  line-height: 1.45;
}

// Campi testo standard (email)
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

.text-input {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: $radius-sm;
  color: $color-text;
  font-size: 0.95rem;
  padding: 10px 12px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s ease;

  &::placeholder { color: $color-text-dim; }
  &:focus { border-color: rgba(255, 255, 255, 0.5); }
}

.field-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;

  label { margin-bottom: 0; }
}

.forgot-link {
  background: none;
  border: none;
  color: $color-text-dim;
  font-size: 0.78rem;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.15s ease;
  &:hover { color: $color-text; }
}

// Messaggi
.auth-error {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-bottom: $space-sm;
  background: rgba(255, 107, 107, 0.08);
  border-left: 3px solid #ff6b6b;
  padding: 8px 10px;
  border-radius: 0 $radius-sm $radius-sm 0;
}

.auth-info {
  color: #6bd17a;
  font-size: 0.85rem;
  margin-bottom: $space-sm;
  background: rgba(107, 209, 122, 0.08);
  border-left: 3px solid #6bd17a;
  padding: 8px 10px;
  border-radius: 0 $radius-sm $radius-sm 0;
  line-height: 1.4;
}

// Pulsante submit
.auth-submit {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: $color-accent;
  color: $color-text;
  border: none;
  border-radius: $radius-sm;
  padding: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease;
  margin-top: $space-sm;

  &:hover:not(:disabled) { opacity: 0.88; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.spinner {
  @include spinner(14px);
}

.auth-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: $space-lg;
  font-size: 0.88rem;
  color: $color-text-dim;
}

.switch-btn {
  background: none;
  border: none;
  color: $color-accent;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.15s ease;
  &:hover { opacity: 0.8; }
}

.back-link {
  color: $color-text-dim;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 400;
  i { font-size: 0.8rem; }
  &:hover { color: $color-text; opacity: 1; }
}
</style>
