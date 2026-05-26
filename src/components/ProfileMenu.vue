<script>
import { useAuthStore } from '../stores/auth.js';
import { isSupabaseConfigured } from '../services/supabase.js';
import AuthModal from './AuthModal.vue';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB

export default {
  name: 'ProfileMenu',
  components: { AuthModal },
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
      this.uploadError = '';
    },
    onOutsideClick(e) {
      if (this.open && this.$refs.root && !this.$refs.root.contains(e.target)) {
        this.open = false;
      }
    },

    // Avatar — upload diretto, nessuna rimozione esplicita
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

    openAuth(mode = 'login') {
      this.authInitialMode = mode;
      this.showAuthModal = true;
      this.open = false;
    },
    goToAccount() {
      this.open = false;
      this.$router.push('/account');
    },
    async logout() {
      this.open = false;
      await this.auth.signOut();
      if (this.$route.path === '/my-list' || this.$route.path === '/account') {
        this.$router.push('/');
      }
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

      <!-- NON LOGGATO -->
      <template v-if="supabaseEnabled && !auth.isLoggedIn">
        <p class="dropdown-hint">Accedi per salvare i tuoi preferiti</p>
        <button class="dropdown-item accent" @click="openAuth('signup')">
          <i class="fa-solid fa-user-plus"></i> Registrati
        </button>
        <button class="dropdown-item" @click="openAuth('login')">
          <i class="fa-solid fa-right-to-bracket"></i> Accedi
        </button>
      </template>

      <!-- LOGGATO: solo 2 voci -->
      <template v-else-if="!supabaseEnabled || auth.isLoggedIn">
        <!-- Voce 1: Account (avatar + nome/email) -->
        <button class="dropdown-item account-item" @click="goToAccount">
          <span class="account-avatar-mini">
            <img v-if="auth.avatarUrl" :src="auth.avatarUrl" alt="Avatar" class="mini-img" />
            <i v-else class="fa-solid fa-circle-user"></i>
          </span>
          <span class="account-info">
            <span class="account-label">Account</span>
            <span class="account-name">{{ auth.fullName || auth.email }}</span>
          </span>
          <i class="fa-solid fa-chevron-right chevron-right"></i>
        </button>

        <hr class="dropdown-divider" />

        <!-- Voce 2: Esci -->
        <button class="dropdown-item danger" @click="logout">
          <i class="fa-solid fa-right-from-bracket"></i> Esci
        </button>
      </template>

      <p v-if="uploadError" class="dropdown-error">{{ uploadError }}</p>
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
  line-height: 1;
  display: block;
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

// Voce Account con avatar mini
.account-item {
  align-items: center;
  gap: 12px;
  padding: 10px;
}

.account-avatar-mini {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: $color-accent;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  font-size: 1.4rem;
  color: $color-text;

  i {
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.mini-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.account-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.account-label {
  font-size: 0.7rem;
  color: $color-text-dim;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.account-name {
  font-size: 0.88rem;
  color: $color-text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron-right {
  font-size: 0.7rem;
  color: $color-text-dim;
  flex-shrink: 0;
}

// Voci generiche
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

  i { width: 16px; text-align: center; flex-shrink: 0; }

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

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
