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
      typeFilter: 'all', // 'all' | 'movie' | 'tv'
    };
  },
  computed: {
    requiresLogin() {
      return this.supabaseEnabled && !this.auth.isLoggedIn;
    },
    movieCount() {
      return this.favorites.items.filter((i) => i.media_type === 'movie').length;
    },
    tvCount() {
      return this.favorites.items.filter((i) => i.media_type === 'tv').length;
    },
    filterChips() {
      return [
        { value: 'all',   label: 'Tutti',    count: this.favorites.items.length },
        { value: 'movie', label: 'Film',     count: this.movieCount },
        { value: 'tv',    label: 'Serie TV', count: this.tvCount },
      ];
    },
    filteredItems() {
      if (this.typeFilter === 'all') return this.favorites.items;
      return this.favorites.items.filter((i) => i.media_type === this.typeFilter);
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
  <section v-else class="container-list">
    <div class="page-header">
      <h2>Preferiti</h2>

      <!-- Chips Tutti / Film / Serie TV -->
      <div v-if="favorites.items.length > 0" class="filter-chips" role="group" aria-label="Filtra per tipo">
        <button
          v-for="chip in filterChips"
          :key="chip.value"
          class="filter-chip"
          :class="{ active: typeFilter === chip.value }"
          :disabled="chip.count === 0 && chip.value !== 'all'"
          :aria-pressed="typeFilter === chip.value"
          @click="typeFilter = chip.value"
        >
          {{ chip.label }}
          <span class="chip-count">{{ chip.count }}</span>
        </button>
      </div>
    </div>

    <EmptyState
      v-if="favorites.items.length === 0"
      message="Nessun titolo nei preferiti"
    />
    <p v-else-if="filteredItems.length === 0" class="filter-empty">
      Nessun preferito in questa categoria.
    </p>
    <div v-else class="card-grid">
      <div v-for="item in filteredItems" :key="item.media_type + '-' + item.tmdb_id">
        <MovieCard :item="item" :media-type="item.media_type" />
      </div>
      <div v-for="n in 6" :key="'fill-' + n" class="card-fill" aria-hidden="true"></div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;

.container-list {
  padding: 12vh 40px 40px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: $space-md;
  margin-bottom: 24px;

  h2 {
    font-weight: 700;
    margin: 0;
  }
}

// ── Chips tipo ────────────────────────────────────────────────────────────
.filter-chips {
  display: flex;
  gap: $space-sm;
  flex-wrap: wrap;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  background: transparent;
  color: $color-text-muted;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 5px 14px;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;

  &:hover:not(:disabled) {
    border-color: rgba(255, 255, 255, 0.55);
    color: $color-text;
  }

  &.active {
    background-color: $color-text;
    border-color: $color-text;
    color: #000;
    font-weight: 700;

    .chip-count { color: rgba(0, 0, 0, 0.5); }

    &:hover { color: #000; border-color: $color-text; }
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}

.chip-count {
  font-size: 0.75rem;
  color: $color-text-dim;
  font-weight: 400;
}

// ── Griglia ───────────────────────────────────────────────────────────────
.card-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, 1fr);

  @media (min-width: 480px)  { grid-template-columns: repeat(4, 1fr); }
  @media (min-width: 768px)  { grid-template-columns: repeat(5, 1fr); }
  @media (min-width: 992px)  { grid-template-columns: repeat(6, 1fr); }
  @media (min-width: 1280px) { grid-template-columns: repeat(7, 1fr); }
}

.card-fill {
  visibility: hidden;
  pointer-events: none;
}

.filter-empty {
  text-align: center;
  font-style: italic;
  color: $color-text-dim;
  padding: 40px 0;
}

@media (max-width: 768px) {
  .container-list { padding: 12vh 16px 32px; }
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

// ── Schermata login richiesto ─────────────────────────────────────────────
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

  &.btn-wall-primary  { background-color: $color-accent; color: $color-text; }
  &.btn-wall-secondary { background-color: rgba(109, 109, 110, 0.7); color: $color-text; }
}
</style>
