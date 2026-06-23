<script>
import { getPersonDetails, getPersonCredits, getWatchProviders } from '../services/tmdb.js';
import { hasRequiredData } from '../utils/media.js';
import { useSearchStore } from '../stores/search.js';
import MovieCard from './MovieCard.vue';
import SearchFilters from './SearchFilters.vue';
import PageLoader from './PageLoader.vue';
import LoadingSkeleton from './LoadingSkeleton.vue';
import EmptyState from './EmptyState.vue';

const PROFILE_BASE = 'https://image.tmdb.org/t/p/w300';

export default {
  name: 'PersonDetail',
  components: { MovieCard, SearchFilters, PageLoader, LoadingSkeleton, EmptyState },
  setup() {
    return { searchStore: useSearchStore() };
  },
  data() {
    return {
      loading: true,
      person: null,
      credits: [],          // crediti grezzi (deduplicati, con i campi minimi)

      // Filtri (stessi delle altre sezioni)
      typeFilter: 'all',
      selectedGenres: [],
      sortBy: 'popularity',
      sortOrder: 'desc',
      providerFilter: [],
      providerCache: {},     // 'tmdb_id:media_type' -> [provider_id…]
      loadingProviders: false,
    };
  },
  computed: {
    personId() { return this.$route.params.id; },

    genresList()    { return this.searchStore.genresList; },
    providersList() { return this.searchStore.providersList.filter((p) => p.provider_id !== 'cinema'); },

    profileUrl() {
      return this.person?.profile_path ? `${PROFILE_BASE}${this.person.profile_path}` : null;
    },
    bio() { return (this.person?.biography || '').trim(); },
    birthLine() {
      const parts = [];
      if (this.person?.birthday) parts.push(this.formatDate(this.person.birthday));
      if (this.person?.place_of_birth) parts.push(this.person.place_of_birth);
      return parts.join(' · ');
    },

    // Crediti dopo i filtri generi + provider (NON il tipo): base per i contatori chip
    baseCredits() {
      let items = this.credits;
      if (this.selectedGenres.length > 0) {
        items = items.filter((c) => this.selectedGenres.some((g) => c.genre_ids?.includes(g)));
      }
      if (this.providerFilter.length > 0) {
        items = items.filter((c) => {
          const ids = this.providerCache[`${c.id}:${c.media_type}`];
          return ids ? this.providerFilter.some((p) => ids.includes(p)) : false;
        });
      }
      return items;
    },
    sortedMovies() { return this.sortItems(this.baseCredits.filter((c) => c.media_type === 'movie')); },
    sortedSeries() { return this.sortItems(this.baseCredits.filter((c) => c.media_type === 'tv')); },
    visibleMovies() { return this.typeFilter !== 'tv' ? this.sortedMovies : []; },
    visibleSeries() { return this.typeFilter !== 'movie' ? this.sortedSeries : []; },
    hasAnyCredits() { return this.sortedMovies.length > 0 || this.sortedSeries.length > 0; },
    filterChips() {
      return [
        { value: 'all',   label: 'Tutti',    count: this.sortedMovies.length + this.sortedSeries.length },
        { value: 'movie', label: 'Film',     count: this.sortedMovies.length },
        { value: 'tv',    label: 'Serie TV', count: this.sortedSeries.length },
      ];
    },
  },
  watch: {
    '$route.params.id'() { this.load(); },
  },
  mounted() {
    this.searchStore.fetchGenres();
    this.searchStore.fetchProviders();
    this.load();
  },
  methods: {
    formatDate(d) {
      try {
        return new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
      } catch { return d; }
    },
    sortItems(items) {
      const order = this.sortOrder === 'asc' ? 1 : -1;
      const arr = [...items];
      if (this.sortBy === 'release_date') {
        return arr.sort((a, b) => {
          const da = a.release_date || a.first_air_date || '';
          const db = b.release_date || b.first_air_date || '';
          return da < db ? -order : da > db ? order : 0;
        });
      }
      if (this.sortBy === 'vote_average') {
        return arr.sort((a, b) => ((a.vote_average || 0) - (b.vote_average || 0)) * order);
      }
      return arr.sort((a, b) => ((a.popularity || 0) - (b.popularity || 0)) * order);
    },

    async load() {
      this.loading = true;
      this.resetFilters();
      try {
        const [person, credits] = await Promise.all([
          getPersonDetails(this.personId),
          getPersonCredits(this.personId),
        ]);
        this.person = person;
        // Deduplica per id+tipo e tiene solo i titoli con i campi minimi
        const seen = new Set();
        this.credits = credits.filter((c) => {
          if (!hasRequiredData(c)) return false;
          const key = `${c.id}:${c.media_type}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      } catch (e) {
        console.error('Errore caricamento dettaglio attore:', e);
        this.person = null;
        this.credits = [];
      } finally {
        this.loading = false;
      }
    },

    resetFilters() {
      this.typeFilter = 'all';
      this.selectedGenres = [];
      this.sortBy = 'popularity';
      this.sortOrder = 'desc';
      this.providerFilter = [];
    },

    onGenresChange(val)    { this.selectedGenres = val; },
    onSortByChange(val)    { this.sortBy = val; },
    onSortOrderChange(val) { this.sortOrder = val; },

    async onProvidersChange(val) {
      this.providerFilter = val;
      if (!val.length) return;
      const toFetch = this.credits.filter((c) => !(`${c.id}:${c.media_type}` in this.providerCache));
      if (!toFetch.length) return;
      this.loadingProviders = true;
      try {
        for (let i = 0; i < toFetch.length; i += 5) {
          await Promise.all(
            toFetch.slice(i, i + 5).map(async (c) => {
              const key = `${c.id}:${c.media_type}`;
              try {
                const p = await getWatchProviders(c.id, c.media_type);
                this.providerCache[key] = (p?.flatrate || []).map((x) => x.provider_id);
              } catch { this.providerCache[key] = []; }
            })
          );
        }
      } finally { this.loadingProviders = false; }
    },
  },
};
</script>

<template>
  <section class="person-page">
    <PageLoader :visible="loading || loadingProviders" />

    <template v-if="!loading && person">
      <!-- ── Pannello dettagli attore ── -->
      <div class="person-hero">
        <div class="person-photo">
          <img v-if="profileUrl" :src="profileUrl" :alt="person.name" />
          <div v-else class="person-photo--placeholder"><i class="fa-solid fa-user"></i></div>
        </div>
        <div class="person-info">
          <h1 class="person-name">{{ person.name }}</h1>
          <p v-if="birthLine" class="person-birth">
            <i class="fa-solid fa-cake-candles"></i> {{ birthLine }}
          </p>
          <div class="person-bio">
            <h2 class="bio-title">Biografia</h2>
            <p v-if="bio" class="bio-text">{{ bio }}</p>
            <p v-else class="bio-empty">Biografia non disponibile.</p>
          </div>
        </div>
      </div>

      <!-- ── Filmografia ── -->
      <h2 class="filmo-title">Film e serie TV</h2>

      <div class="controls-row">
        <div class="filter-chips" role="group" aria-label="Filtra per tipo">
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

        <SearchFilters
          :genres-list="genresList"
          :genres="selectedGenres"
          :sort-by="sortBy"
          :sort-order="sortOrder"
          :providers-list="providersList"
          :providers="providerFilter"
          @update:genres="onGenresChange"
          @update:sort-by="onSortByChange"
          @update:sort-order="onSortOrderChange"
          @update:providers="onProvidersChange"
        />
      </div>

      <!-- ── Risultati ── -->
      <EmptyState v-if="!hasAnyCredits" message="Nessun titolo con questi filtri" />

      <template v-else>
        <!-- Film -->
        <section v-if="visibleMovies.length" class="result-section">
          <div v-if="typeFilter === 'all'" class="section-header">
            <span class="section-badge badge-movie"><i class="fa-solid fa-film"></i> Film</span>
            <span class="section-count">{{ visibleMovies.length }} titol{{ visibleMovies.length === 1 ? 'o' : 'i' }}</span>
          </div>
          <div class="card-grid">
            <div v-for="m in visibleMovies" :key="'m-' + m.id">
              <MovieCard :item="m" media-type="movie" show-type-badge />
            </div>
          </div>
        </section>

        <hr v-if="typeFilter === 'all' && visibleMovies.length && visibleSeries.length" class="section-divider" />

        <!-- Serie TV -->
        <section v-if="visibleSeries.length" class="result-section">
          <div v-if="typeFilter === 'all'" class="section-header">
            <span class="section-badge badge-tv"><i class="fa-solid fa-tv"></i> Serie TV</span>
            <span class="section-count">{{ visibleSeries.length }} titol{{ visibleSeries.length === 1 ? 'o' : 'i' }}</span>
          </div>
          <div class="card-grid">
            <div v-for="s in visibleSeries" :key="'s-' + s.id">
              <MovieCard :item="s" media-type="tv" show-type-badge />
            </div>
          </div>
        </section>
      </template>
    </template>

    <!-- Attore non trovato -->
    <EmptyState v-else-if="!loading && !person" message="Attore non trovato" />
  </section>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;
@use '../assets/scss/partials/mixins' as *;

.person-page {
  padding: 12vh 40px 60px;
  min-height: 100vh;
}

// ── Pannello dettagli attore ────────────────────────────────────────────────
.person-hero {
  display: flex;
  gap: $space-xl;
  margin-bottom: $space-xl;
  padding: $space-lg;
  border-radius: $radius-md;
  background:
    radial-gradient(ellipse at top left, rgba(245, 158, 11, 0.12) 0%, transparent 60%),
    $color-surface;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.person-photo {
  flex-shrink: 0;
  width: 200px;
  aspect-ratio: 2 / 3;
  border-radius: $radius-md;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

  img { width: 100%; height: 100%; object-fit: cover; display: block; }

  &--placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.2);
    font-size: 3rem;
  }
}

.person-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.person-role {
  align-self: flex-start;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: $color-accent;
  background-color: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: $space-sm;
}

.person-name {
  font-size: clamp(1.7rem, 4vw, 2.6rem);
  font-weight: 800;
  margin: 0 0 $space-sm;
  line-height: 1.1;
}

.person-birth {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.9rem;
  color: $color-text-dim;
  margin: 0 0 $space-md;

  i { color: $color-text-dim; font-size: 0.85rem; }
}

.person-bio {
  font-size: 0.95rem;
  line-height: 1.6;
  color: $color-text-muted;
}

.bio-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: $color-text-dim;
  margin: 0 0 $space-sm;
}

// Altezza fissa: una bio lunga scrolla solo qui, senza ingigantire il pannello.
.bio-text {
  margin: 0;
  max-height: 150px;
  overflow-y: auto;
  padding-right: $space-sm;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; }
}

.bio-empty { color: $color-text-dim; font-style: italic; margin: 0; }

// ── Titolo sezione filmografia ───────────────────────────────────────────────
.filmo-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 $space-md;
}

// ── Controlli / filtri ─────────────────────────────────────────────────────
.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: $space-md;
  margin-bottom: $space-lg;
}

@include filter-chips;

// ── Sezioni risultati ──────────────────────────────────────────────────────
.result-section { margin-bottom: $space-xl; }

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

  &.badge-movie { background-color: rgba(245, 158, 11, 0.18); color: #fcd34d; border-left: 3px solid $color-accent; }
  &.badge-tv    { background-color: rgba(100, 149, 237, 0.15); color: #7eb5ff; border-left: 3px solid #6495ed; }
}

.section-count { font-size: 0.85rem; color: $color-text-dim; }

.section-divider {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin: $space-xl 0;
}

.card-grid { @include card-grid; }

@media (max-width: $bp-md) {
  .person-page { padding: 12vh 16px 40px; }
  .person-hero {
    flex-direction: column;
    gap: $space-md;
    padding: $space-md;
  }
  .person-photo { width: 140px; align-self: flex-start; }
}
</style>
