<script>
import { ref, nextTick } from 'vue';
import { useSearchStore } from '../stores/search.js';

export default {
  name: 'BottomNav',
  setup() {
    const search = useSearchStore();

    const searchOpen = ref(false);
    const searchInput = ref(null);

    function toggleSearch() {
      searchOpen.value = !searchOpen.value;
      if (searchOpen.value) {
        // Focus automatico sull'input alla apertura
        nextTick(() => searchInput.value?.focus());
      } else {
        // Chiude senza resettare il testo (l'utente potrebbe volerlo mantenere)
      }
    }

    function closeSearch() {
      searchOpen.value = false;
    }

    function onSearchInput(e) {
      // Aggiorna solo il testo: il watcher in App.vue gestisce search.run() e la navigazione
      search.text = e.target.value;
    }

    function clearSearch() {
      search.text = '';
      searchInput.value?.focus();
    }

    return { search, searchOpen, searchInput, toggleSearch, closeSearch, onSearchInput, clearSearch };
  },
  data() {
    return {
      navItems: [
        { to: '/film', label: 'Film', icon: 'fa-film' },
        { to: '/series', label: 'Serie', icon: 'fa-tv' },
        { to: '/', label: 'Home', icon: 'fa-house' },
        { to: '/my-list', label: 'Preferiti', icon: 'fa-bookmark' },
      ],
    };
  },
};
</script>

<template>
  <!-- Barra di ricerca espansa (sopra la bottom-nav) -->
  <transition name="search-slide">
    <div v-if="searchOpen" class="mobile-search-bar">
      <div class="mobile-search-inner">
        <i class="fa-solid fa-magnifying-glass search-icon-inline"></i>
        <input
          ref="searchInput"
          type="search"
          class="mobile-search-input"
          placeholder="Cerca film o serie…"
          :value="search.text"
          @input="onSearchInput"
          aria-label="Cerca"
        />
        <button v-if="search.text" class="search-clear" @click="clearSearch" aria-label="Cancella ricerca">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <button class="search-close" @click="closeSearch" aria-label="Chiudi ricerca">
          <i class="fa-solid fa-chevron-down"></i>
        </button>
      </div>
    </div>
  </transition>

  <!-- Bottom nav -->
  <nav class="bottom-nav" aria-label="Navigazione principale">
    <router-link
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="bottom-nav-item"
      :class="{ active: $route.path === item.to }"
      @click="closeSearch"
    >
      <i :class="['fa-solid', item.icon]"></i>
      <span>{{ item.label }}</span>
    </router-link>

    <!-- Pulsante ricerca al centro -->
    <button
      class="bottom-nav-item search-toggle"
      :class="{ active: searchOpen }"
      @click="toggleSearch"
      aria-label="Cerca"
      :aria-expanded="searchOpen"
    >
      <i class="fa-solid fa-magnifying-glass"></i>
      <span>Cerca</span>
    </button>
  </nav>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;

// ---- Bottom nav ----
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: $z-header;
  display: none;
  justify-content: space-around;
  align-items: center;
  height: 64px;
  background-color: rgba(0, 0, 0, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  padding: 6px 0;
  color: $color-text-dim;
  font-size: 0.7rem;
  text-decoration: none;
  transition: color 0.15s ease;
  background: none;
  border: none;
  cursor: pointer;

  i {
    font-size: 1.15rem;
  }

  &.active,
  &:hover {
    color: $color-text;
  }

  // Icona ricerca: colore accent quando attivo
  &.search-toggle.active {
    color: $color-accent;
  }
}

// Visibile solo sotto il breakpoint desktop
@media (max-width: $bp-lg) {
  .bottom-nav {
    display: flex;
  }
}

// ---- Barra di ricerca mobile ----
.mobile-search-bar {
  position: fixed;
  bottom: 64px; // sopra la bottom-nav (compensiamo safe-area più avanti)
  left: 0;
  width: 100%;
  z-index: $z-header;
  background-color: rgba(15, 15, 15, 0.97);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 16px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
  backdrop-filter: blur(12px);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
}

.mobile-search-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 10px 16px;
  transition: border-color 0.15s ease;

  &:focus-within {
    border-color: rgba(255, 255, 255, 0.5);
  }
}

.search-icon-inline {
  color: $color-text-dim;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.mobile-search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: $color-text;
  font-size: 1rem;
  min-width: 0;

  &::placeholder {
    color: $color-text-dim;
  }

  // Rimuove la X nativa di Safari/Chrome per `type="search"`
  &::-webkit-search-cancel-button {
    display: none;
  }
}

.search-clear,
.search-close {
  background: none;
  border: none;
  color: $color-text-dim;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  font-size: 1rem;
  transition: color 0.15s ease;
  flex-shrink: 0;

  &:hover {
    color: $color-text;
  }
}

// Animazione slide-up
.search-slide-enter-active,
.search-slide-leave-active {
  transition: transform 0.22s ease, opacity 0.22s ease;
}
.search-slide-enter-from,
.search-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
