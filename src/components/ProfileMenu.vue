<script>
import { useAuthStore } from '../stores/auth.js';
import { isSupabaseConfigured } from '../services/supabase.js';
import { isPasswordValid } from '../utils/password.js';
import AuthModal from './AuthModal.vue';
import PasswordInput from './PasswordInput.vue';
import PasswordStrength from './PasswordStrength.vue';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB

export default {
  name: 'ProfileMenu',
  components: { AuthModal, PasswordInput, PasswordStrength },
  setup() {
    const auth = useAuthStore();
    return { auth };
  },
  data() {
    return {
      open: false,
      showAuthModal: false,
      authInitialMode: 'login',
      supabaseEnabled: isSupabaseConfigured,
      uploadError: '',

      // Sezione cambio password
      showChangePassword: false,
      newPassword: '',
      confirmPassword: '',
      pwTouched: false,
      pwError: '',
      pwSuccess: '',
      pwLoading: false,
    };
  },
  mounted() {
    document.addEventListener('click', this.onOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.onOutsideClick);
  },
  methods: {
    toggle() {
      this.open = !this.open;
      if (!this.open) this.resetPasswordForm();
      this.uploadError = '';
    },
    onOutsideClick(e) {
      if (this.open && this.$refs.root && !this.$refs.root.contains(e.target)) {
        this.open = false;
        this.resetPasswordForm();
      }
    },

    // Avatar
    triggerUpload() {
      this.uploadError = '';
      this.$refs.fileInput.click();
    },
    onFile(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        this.uploadError = 'Seleziona un file immagine.';
        return;
      }
      if (file.size > MAX_AVATAR_BYTES) {
        this.uploadError = 'Immagine troppo grande (max 2 MB).';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.auth.setAvatar(reader.result);
        this.open = false;
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    removeAvatar() {
      this.auth.removeAvatar();
    },

    // Auth modale
    openAuth(mode = 'login') {
      this.authInitialMode = mode;
      this.showAuthModal = true;
      this.open = false;
    },
    async logout() {
      this.open = false;
      await this.auth.signOut();
      if (this.$route.path === '/my-list') this.$router.push('/');
    },

    // Cambio password
    togglePasswordForm() {
      this.showChangePassword = !this.showChangePassword;
      if (!this.showChangePassword) this.resetPasswordForm();
    },
    resetPasswordForm() {
      this.showChangePassword = false;
      this.newPassword = '';
      this.confirmPassword = '';
      this.pwTouched = false;
      this.pwError = '';
      this.pwSuccess = '';
      this.pwLoading = false;
    },
    onPwInput(val) {
      this.newPassword = val;
      this.pwTouched = true;
      this.pwError = '';
      this.pwSuccess = '';
    },
    async submitPasswordChange() {
      this.pwError = '';
      this.pwSuccess = '';
      if (!isPasswordValid(this.newPassword)) {
        this.pwError = 'La password non soddisfa tutti i requisiti.';
        return;
      }
      if (this.newPassword !== this.confirmPassword) {
        this.pwError = 'Le password non coincidono.';
        return;
      }
      this.pwLoading = true;
      try {
        await this.auth.changePassword(this.newPassword);
        this.pwSuccess = 'Password aggiornata con successo.';
        this.newPassword = '';
        this.confirmPassword = '';
        this.pwTouched = false;
      } catch (err) {
        this.pwError = err?.message || 'Errore durante l\'aggiornamento.';
      } finally {
        this.pwLoading = false;
      }
    },
  },
  computed: {
    pwValid() {
      return isPasswordValid(this.newPassword);
    },
  },
};
</script>

<template>
  <div class="profile-menu" ref="root">
    <!-- Pulsante avatar rotondo -->
    <button class="avatar-btn" @click="toggle" :aria-expanded="open" aria-haspopup="true" aria-label="Menu profilo">
      <img v-if="auth.avatarUrl" :src="auth.avatarUrl" alt="Avatar" class="avatar-img" />
      <i v-else class="fa-solid fa-user avatar-default"></i>
    </button>

    <!-- Dropdown -->
    <div class="dropdown" v-if="open">

      <!-- ====== NON LOGGATO ====== -->
      <template v-if="supabaseEnabled && !auth.isLoggedIn">
        <p class="dropdown-hint">Accedi per salvare i tuoi preferiti</p>
        <button class="dropdown-item accent" @click="openAuth('signup')">
          <i class="fa-solid fa-user-plus"></i> Registrati
        </button>
        <button class="dropdown-item" @click="openAuth('login')">
          <i class="fa-solid fa-right-to-bracket"></i> Accedi
        </button>
        <hr class="dropdown-divider" />
      </template>

      <!-- ====== LOGGATO ====== -->
      <template v-if="!supabaseEnabled || auth.isLoggedIn">
        <!-- Sezione credenziali -->
        <template v-if="supabaseEnabled && auth.isLoggedIn">
          <div class="dropdown-credentials">
            <i class="fa-solid fa-circle-user cred-icon"></i>
            <div>
              <span class="cred-label">Account</span>
              <span class="cred-email">{{ auth.email }}</span>
            </div>
          </div>
          <hr class="dropdown-divider" />
        </template>

        <!-- Avatar -->
        <button class="dropdown-item" @click="triggerUpload">
          <i class="fa-solid fa-image"></i> Carica immagine
        </button>
        <button v-if="auth.avatarUrl" class="dropdown-item danger" @click="removeAvatar">
          <i class="fa-solid fa-trash"></i> Rimuovi immagine
        </button>
        <p v-if="uploadError" class="dropdown-error">{{ uploadError }}</p>

        <!-- Cambio password (solo Supabase) -->
        <template v-if="supabaseEnabled && auth.isLoggedIn">
          <hr class="dropdown-divider" />
          <button class="dropdown-item" @click="togglePasswordForm">
            <i class="fa-solid fa-key"></i> Cambia password
            <i :class="['fa-solid', showChangePassword ? 'fa-chevron-up' : 'fa-chevron-down', 'chevron']"></i>
          </button>

          <div v-if="showChangePassword" class="pw-form">
            <!-- Nuova password con eye icon -->
            <PasswordInput
              :model-value="newPassword"
              @update:model-value="onPwInput"
              placeholder="Nuova password"
              autocomplete="new-password"
            />
            <!-- Forza password + regole (appare appena si digita) -->
            <PasswordStrength
              v-if="pwTouched && newPassword.length > 0"
              :password="newPassword"
            />

            <!-- Conferma con eye icon -->
            <PasswordInput
              :model-value="confirmPassword"
              @update:model-value="(v) => { confirmPassword = v; pwError = ''; }"
              placeholder="Conferma password"
              autocomplete="new-password"
              class="pw-confirm"
            />

            <p v-if="pwError"   class="pw-msg pw-msg--error">{{ pwError }}</p>
            <p v-if="pwSuccess" class="pw-msg pw-msg--success">{{ pwSuccess }}</p>

            <button
              class="pw-submit"
              @click="submitPasswordChange"
              :disabled="pwLoading || !pwValid || newPassword !== confirmPassword"
            >
              {{ pwLoading ? 'Salvataggio…' : 'Salva password' }}
            </button>
          </div>

          <hr class="dropdown-divider" />
          <button class="dropdown-item" @click="logout">
            <i class="fa-solid fa-right-from-bracket"></i> Esci
          </button>
        </template>
      </template>
    </div>

    <input ref="fileInput" type="file" accept="image/*" class="visually-hidden" @change="onFile" />
    <AuthModal v-if="showAuthModal" :initial-mode="authInitialMode" @close="showAuthModal = false" />
  </div>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;

.profile-menu {
  position: relative;
}

.avatar-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  background-color: $color-accent;
  color: $color-text;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.15s ease;

  &:hover {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.6);
  }
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-default {
  font-size: 1.05rem;
}

// ---- Dropdown ----
.dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  min-width: 240px;
  background-color: rgba(20, 20, 20, 0.97);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: $radius-md;
  padding: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
  z-index: $z-modal;
  backdrop-filter: blur(10px);
}

.dropdown-hint {
  font-size: 0.8rem;
  color: $color-text-dim;
  padding: 4px 10px 8px;
  margin: 0;
}

// Sezione credenziali
.dropdown-credentials {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
}

.cred-icon {
  font-size: 1.8rem;
  color: $color-text-dim;
  flex-shrink: 0;
}

.cred-label {
  display: block;
  font-size: 0.7rem;
  color: $color-text-dim;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.cred-email {
  display: block;
  font-size: 0.88rem;
  color: $color-text;
  word-break: break-all;
}

// Voci del menu
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: none;
  border: none;
  color: $color-text-muted;
  font-size: 0.9rem;
  text-align: left;
  padding: 9px 10px;
  border-radius: $radius-sm;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;

  i {
    width: 16px;
    text-align: center;
    flex-shrink: 0;
  }

  .chevron {
    margin-left: auto;
    font-size: 0.7rem;
    color: $color-text-dim;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
    color: $color-text;
  }

  &.accent {
    color: $color-accent;
    font-weight: 600;
    &:hover { color: $color-accent; }
  }

  &.danger {
    color: #ff6b6b;
    &:hover { color: #ff4444; }
  }
}

.dropdown-divider {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 6px 4px;
}

.dropdown-error {
  color: #ff6b6b;
  font-size: 0.8rem;
  padding: 4px 10px;
  margin: 0;
}

// ---- Form cambio password ----
.pw-form {
  padding: 4px 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  // PasswordInput nel dropdown: font più piccolo per stare nel pannello
  :deep(.pw-field) {
    font-size: 0.88rem;
    padding: 8px 36px 8px 10px;
  }
  :deep(.pw-eye) {
    font-size: 0.82rem;
    right: 8px;
  }

  // Override PasswordStrength per il dropdown (compatta)
  :deep(.pw-strength) {
    font-size: 0.72rem;
  }
}

// Spazio extra prima del campo di conferma
.pw-confirm {
  margin-top: 2px;
}

.pw-msg {
  font-size: 0.8rem;
  margin: 0;

  &--error  { color: #ff6b6b; }
  &--success { color: #6bd17a; }
}

.pw-submit {
  background-color: $color-accent;
  color: $color-text;
  border: none;
  border-radius: $radius-sm;
  padding: 8px 14px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;
  align-self: flex-end;

  &:hover:not(:disabled) { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
