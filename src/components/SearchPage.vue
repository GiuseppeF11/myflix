<script>
import { nextTick, watch } from 'vue';
import { useSearchStore } from '../stores/search.js';
import { debounce } from '../utils/debounce.js';
import MovieCard from './MovieCard.vue';
import SearchFilters from './SearchFilters.vue';
import LoadingSkeleton from './LoadingSkeleton.vue';
import SearchModeToggle from './SearchModeToggle.vue';

export default {
  name: 'SearchPage',
  components: { MovieCard, SearchFilters, LoadingSkeleton, SearchModeToggle },
  setup() {
    const search = useSearchStore();
    search.fetchGenres();
    search.fetchProviders();

    // Debounce: non parte una ricerca ad ogni carattere digitato
    const debouncedRun = debounce(() => search.run(), 300);
    watch(() => search.text, debouncedRun);

    return { search };
  },
  mounted() {
    document.addEventListener('click', this.onOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.onOutside);
  },
  computed: {
    hasQuery() {
      // In modalità cast non c'è una griglia risultati: il dropdown gestisce tutto
      if (this.search.isCastMode) return false;
      return this.search.text.trim().length > 0 || this.search.genres.length > 0 || this.search.providers.length > 0;
    },
    filterChips() {
      return [
        { value: 'all',   label: 'Tutti',    count: this.search.totalCount },
        { value: 'movie', label: 'Film',     count: this.search.movies.length },
        { value: 'tv',    label: 'Serie TV', count: this.search.series.length },
      ];
    },
    showMovies()  { return this.search.visibleMovies.length > 0; },
    showSeries()  { return this.search.visibleSeries.length > 0; },
    showFilteredEmpty() {
      return !this.search.loading && this.search.hasResults && !this.showMovies && !this.showSeries;
    },
  },
  mounted() {
    // Su mobile: focus automatico all'apertura della pagina
    nextTick(() => {
      if (window.innerWidth < 992) {
        this.$refs.mobileInput?.focus();
      }
    });
    // Se c'è già testo (es. venendo dal desktop) esegui subito la ricerca
    if (this.hasQuery) {
      this.search.run();
    }
  },
  methods: {
    clearSearch() {
      this.search.text = '';
      this.search.clearSuggestions();
      this.$router.push('/');
    },
    goToPerson(id) {
      this.search.clearSuggestions();
      this.$router.push(`/person/${id}`);
    },
    onOutside(e) {
      if (!this.$refs.mobileSearchWrapper?.contains(e.target)) {
        this.search.clearSuggestions();
      }
    },
  },
};
</script>

<template>
  <section class="search-page">

    <!-- ── Input mobile (nascosto su desktop) ── -->
    <div class="mobile-search-wrapper" ref="mobileSearchWrapper">
      <form class="mobile-search-form" @submit.prevent>
        <i class="fa-solid fa-magnifying-glass msf-icon"></i>
        <input
          ref="mobileInput"
          type="search"
          class="msf-input"
          :placeholder="search.searchMode === 'cast' ? 'Cerca un attore…' : 'Cerca film o serie…'"
          v-model="search.text"
          aria-label="Cerca"
        />
        <button
          v-if="search.text"
          class="msf-clear"
          type="button"
          @click="clearSearch"
          aria-label="Cancella ricerca"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </form>
      <div class="mobile-mode-row">
        <span class="mobile-mode-label">Cerca per</span>
        <SearchModeToggle />
      </div>
      <div
        v-if="search.isCastMode && search.personSuggestions.length > 0"
        class="suggestions-dropdown"
      >
        <button
          v-for="p in search.personSuggestions"
          :key="p.id"
          class="suggestion-item"
          @click="goToPerson(p.id)"
        >
          <img
            :src="`https://image.tmdb.org/t/p/w185${p.profile_path}`"
            :alt="p.name"
            class="suggestion-avatar"
          />
          <span class="suggestion-name">{{ p.name }}</span>
        </button>
      </div>
    </div>

    <!-- ── Empty state: ancora nessuna query ── -->
    <div v-if="!hasQuery && !search.loading" class="empty-state">
      <template v-if="search.isCastMode">
        <i class="fa-solid fa-user empty-icon"></i>
        <p class="empty-title">Cerca un attore</p>
        <p class="empty-hint">Digita il nome e seleziona dal menu a tendina</p>
      </template>
      <template v-else>
        <i class="fa-solid fa-magnifying-glass empty-icon"></i>
        <p class="empty-title">Cerca su Cinova</p>
        <p class="empty-hint">Film, serie TV e molto altro ti aspettano</p>
      </template>
    </div>

    <!-- ── Contenuto ricerca ── -->
    <template v-else>

      <!-- Header: label risultati + filtri -->
      <div class="search-header">
        <p class="search-query">
          <template v-if="search.hasResults && !search.loading">
            <span class="query-label">Risultati per</span>
            <strong v-if="search.text.trim()">"{{ search.text }}"</strong>
            <strong v-else>categorie selezionate</strong>
          </template>
          <template v-else-if="!search.loading && !search.hasResults">
            <span v-if="search.text.trim()">
              Nessun risultato per <strong>"{{ search.text }}"</strong>
            </span>
            <span v-else>Nessun risultato per i filtri selezionati</span>
          </template>
        </p>

        <div class="filter-row">
          <!-- Chips tipo -->
          <div v-if="search.hasResults" class="filter-chips" role="group" aria-label="Filtra per tipo">
            <button
              v-for="chip in filterChips"
              :key="chip.value"
              class="filter-chip"
              :class="{ active: search.filter === chip.value }"
              :disabled="chip.count === 0 && chip.value !== 'all'"
              :aria-pressed="search.filter === chip.value"
              @click="search.setFilter(chip.value)"
            >
              {{ chip.label }}
              <span class="chip-count">{{ chip.count }}</span>
            </button>
          </div>

          <!-- Filtri avanzati (generi + ordinamento) -->
          <SearchFilters
            :genres-list="search.genresList"
            :genres="search.genres"
            :sort-by="search.sortBy"
            :sort-order="search.sortOrder"
            :providers-list="search.providersList"
            :providers="search.providers"
            @update:genres="(v) => { search.setGenres(v); search.run(); }"
            @update:sort-by="(v) => { search.setSortBy(v); search.run(); }"
            @update:sort-order="(v) => { search.setSortOrder(v); search.run(); }"
            @update:providers="(v) => { search.setProviders(v); search.run(); }"
          />
        </div>
      </div>

      <!-- Skeleton mentre cerca -->
      <LoadingSkeleton v-if="search.loading" :count="14" />

      <template v-else>
      <!-- Avviso filtro tipo senza risultati -->
      <p v-if="showFilteredEmpty" class="filter-empty">
        Nessun risultato per questa categoria. Prova con "Tutti".
      </p>

      <!-- Sezione Film -->
      <section v-if="showMovies" class="result-section">
        <div v-if="search.filter === 'all'" class="section-header">
          <span class="section-badge badge-movie">
            <i class="fa-solid fa-film"></i> Film
          </span>
          <span class="section-count">
            {{ search.movies.length }} risultat{{ search.movies.length === 1 ? 'o' : 'i' }}
          </span>
        </div>
        <div class="card-grid">
          <div v-for="movie in search.visibleMovies" :key="movie.id">
            <MovieCard :item="movie" media-type="movie" show-type-badge />
          </div>
        </div>
      </section>

      <hr v-if="search.filter === 'all' && showMovies && showSeries" class="section-divider" />

      <!-- Sezione Serie TV -->
      <section v-if="showSeries" class="result-section">
        <div v-if="search.filter === 'all'" class="section-header">
          <span class="section-badge badge-tv">
            <i class="fa-solid fa-tv"></i> Serie TV
          </span>
          <span class="section-count">
            {{ search.series.length }} risultat{{ search.series.length === 1 ? 'o' : 'i' }}
          </span>
        </div>
        <div class="card-grid">
          <div v-for="serie in search.visibleSeries" :key="serie.id">
            <MovieCard :item="serie" media-type="tv" show-type-badge />
          </div>
        </div>
      </section>

      </template><!-- fine v-else (!search.loading) -->
    </template><!-- fine v-else (hasQuery) -->
  </section>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;
@use '../assets/scss/partials/mixins' as *;

.search-page {
  padding: 12vh 40px 60px;
  min-height: 100vh;
}

// ── Input mobile ──────────────────────────────────────────────────────────────
.mobile-search-wrapper {
  display: none; // nascosto su desktop
  margin-bottom: $space-lg;
  position: relative;
}

// ── Dropdown suggerimenti attori (Cast, mobile) ───────────────────────────────
.suggestions-dropdown {
  margin-top: 8px;
  background: $color-surface;
  border-radius: 12px;
  // box-shadow invece di border: nessun lato rettilineo allineato alla search form
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.10), 0 8px 24px rgba(0, 0, 0, 0.5);
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; }
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  color: $color-text;
  transition: background-color 0.15s ease;

  &:hover { background-color: rgba(255, 255, 255, 0.07); }
  &:not(:last-child) { border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
}

.suggestion-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background-color: rgba(255, 255, 255, 0.08);
}

.suggestion-name {
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-search-form {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: rgba(255, 255, 255, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 10px 16px;
  transition: border-color 0.2s ease, background-color 0.2s ease;

  &:focus-within {
    border-color: rgba(255, 255, 255, 0.45);
    background-color: rgba(255, 255, 255, 0.11);
  }
}

.msf-icon {
  color: $color-text-dim;
  font-size: 0.9rem;
  flex-shrink: 0;
  transition: color 0.2s ease;

  .mobile-search-form:focus-within & {
    color: $color-text-muted;
  }
}

.msf-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: $color-text;
  font-size: 1rem;
  min-width: 0;

  &::placeholder { color: $color-text-dim; }
  &::-webkit-search-cancel-button { display: none; }
}

.msf-clear {
  background: none;
  border: none;
  color: $color-text-dim;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  flex-shrink: 0;
  transition: color 0.15s ease;

  &:hover { color: $color-text; }
}

// Mostra l'input solo su mobile
@media (max-width: $bp-lg) {
  .mobile-search-wrapper {
    display: block;
  }
  .search-page {
    padding: 12vh 16px 60px;
  }
}

// ── Empty state ───────────────────────────────────────────────────────────────
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px $space-md 40px;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.15);
  margin-bottom: $space-lg;
}

.empty-title {
  font-size: clamp(1.2rem, 3vw, 1.6rem);
  font-weight: 700;
  margin: 0 0 $space-sm;
}

.empty-hint {
  font-size: 0.9rem;
  color: $color-text-dim;
  margin: 0;
}

// ── Header risultati ─────────────────────────────────────────────────────────
.search-header {
  display: flex;
  flex-direction: column;
  gap: $space-md;
  margin-bottom: $space-lg;
}

.filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: $space-sm;
}

.search-query {
  margin: 0;
  font-size: 1rem;
  color: $color-text-muted;

  .query-label { margin-right: 4px; }
  strong { color: $color-text; }
}

// ── Chips filtro (stile condiviso) ─────────────────────────────────────────────
@include filter-chips;

// ── Griglia card ─────────────────────────────────────────────────────────────
.card-grid { @include card-grid; }

// ── Sezioni risultati ─────────────────────────────────────────────────────────
.result-section {
  margin-bottom: $space-xl;
}

.section-header {
  display: flex;
  align-items: center;
  gap: $space-md;
  margin-bottom: $space-md;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 1rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 4px;

  i { font-size: 0.9rem; }

  &.badge-movie {
    background-color: rgba(219, 25, 39, 0.18);
    color: #ff6b78;
    border-left: 3px solid $color-accent;
  }

  &.badge-tv {
    background-color: rgba(100, 149, 237, 0.15);
    color: #7eb5ff;
    border-left: 3px solid #6495ed;
  }
}

.section-count {
  font-size: 0.85rem;
  color: $color-text-dim;
}

// ── Riga toggle "Cerca per" (solo mobile) ──────────────────────────────────────
.mobile-mode-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-sm;
  margin-top: $space-sm;
}

.mobile-mode-label {
  font-size: 0.8rem;
  color: $color-text-dim;
}

.section-divider {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin: $space-xl 0;
}

.filter-empty {
  text-align: center;
  font-style: italic;
  color: $color-text-dim;
  padding: 40px 0;
}
</style>
