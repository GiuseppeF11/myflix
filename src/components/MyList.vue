<script>
import { useFavoritesStore } from '../stores/favorites.js';
import { useAuthStore } from '../stores/auth.js';
import { isSupabaseConfigured } from '../services/supabase.js';
import MovieCard from './MovieCard.vue';
import EmptyState from './EmptyState.vue';
import AuthModal from './AuthModal.vue';

export default {
  name: 'MyList',
  components: { MovieCard, EmptyState, AuthModal },
  setup() {
    const favorites = useFavoritesStore();
    const auth = useAuthStore();
    return { favorites, auth };
  },
  data() {
    return {
      showAuth: false,
      authInitialMode: 'login',
      supabaseEnabled: isSupabaseConfigured,
    };
  },
  computed: {
    requiresLogin() {
      return this.supabaseEnabled && !this.auth.isLoggedIn;
    },
  },
  methods: {
    openLogin(mode = 'login') {
      this.authInitialMode = mode;
      this.showAuth = true;
    },
  },
};
</script>

<template>
  <!-- Schermata di accesso richiesto -->
  <section v-if="requiresLogin" class="login-wall">
    <div class="login-wall-inner">
      <i class="fa-solid fa-bookmark login-wall-icon"></i>
      <h2>I tuoi preferiti ti aspettano</h2>
      <p>Accedi al tuo account per salvare film e serie TV e ritrovarli sempre.</p>
      <div class="login-wall-actions">
        <button class="btn-wall btn-wall-primary" @click="openLogin('login')">
          <i class="fa-solid fa-right-to-bracket"></i> Accedi
        </button>
        <button class="btn-wall btn-wall-secondary" @click="openLogin('signup')">
          <i class="fa-solid fa-user-plus"></i> Registrati
        </button>
      </div>
    </div>
    <AuthModal v-if="showAuth" :initial-mode="authInitialMode" @close="showAuth = false" />
  </section>

  <!-- Contenuto normale quando loggato -->
  <section v-else class="container-list px-3">
    <h2>Preferiti</h2>
    <EmptyState v-if="favorites.items.length === 0" message="Nessun titolo nei preferiti" />
    <div v-else class="card-grid">
      <div v-for="item in favorites.items" :key="item.media_type + '-' + item.tmdb_id">
        <MovieCard :item="item" :media-type="item.media_type" />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;

.container-list {
  padding: 12vh 40px 40px;

  h2 {
    font-weight: 700;
    margin-bottom: 24px;
  }
}

.card-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, 1fr);

  @media (min-width: 480px)  { grid-template-columns: repeat(4, 1fr); }
  @media (min-width: 768px)  { grid-template-columns: repeat(5, 1fr); }
  @media (min-width: 992px)  { grid-template-columns: repeat(6, 1fr); }
  @media (min-width: 1280px) { grid-template-columns: repeat(7, 1fr); }
}

@media (max-width: 768px) {
  .container-list {
    padding: 12vh 16px 32px;
  }
}

// ---- Schermata login richiesto ----
.login-wall {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $space-xl $space-md;
}

.login-wall-inner {
  text-align: center;
  max-width: 420px;
}

.login-wall-icon {
  font-size: 3.5rem;
  color: $color-accent;
  margin-bottom: $space-lg;
  display: block;
}

.login-wall-inner h2 {
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 700;
  margin-bottom: $space-sm;
}

.login-wall-inner p {
  color: $color-text-muted;
  margin-bottom: $space-lg;
  line-height: 1.5;
}

.login-wall-actions {
  display: flex;
  gap: $space-md;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-wall {
  display: inline-flex;
  align-items: center;
  gap: $space-sm;
  border: none;
  border-radius: $radius-sm;
  padding: 12px 28px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover { opacity: 0.85; }

  &.btn-wall-primary {
    background-color: $color-accent;
    color: $color-text;
  }

  &.btn-wall-secondary {
    background-color: rgba(109, 109, 110, 0.7);
    color: $color-text;
  }
}
</style>
