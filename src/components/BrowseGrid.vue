<script>
import { discoverMovies, discoverTv, getGenres, getWatchProvidersList } from '../services/tmdb.js';
import { hasRequiredData } from '../utils/media.js';
import MovieCard from './MovieCard.vue';
import Pagination from './Pagination.vue';
import LoadingSkeleton from './LoadingSkeleton.vue';
import SearchFilters from './SearchFilters.vue';

const CINEMA_WINDOW_DAYS = 90;

/**
 * Griglia "discover" condivisa da Film.vue e Series.vue.
 * Le uniche differenze tra le due viste sono incapsulate nella prop `mediaType`:
 * endpoint discover, gestione data (first_air_date per le serie), opzione "Al Cinema"
 * (solo film) e lista provider.
 */
export default {
  name: 'BrowseGrid',
  components: { MovieCard, Pagination, LoadingSkeleton, SearchFilters },
  props: {
    mediaType: { type: String, required: true }, // 'movie' | 'tv'
    title:     { type: String, required: true },
  },
  data() {
    return {
      items: [],
      currentPage: 1,
      totalPages: 0,
      loading: false,
      genresList: [],
      genres: [],
      sortBy: 'popularity',
      sortOrder: 'desc',
      providers: [],
      providersList: [],
    };
  },
  computed: {
    isMovie() { return this.mediaType === 'movie'; },
    sortParam() {
      // Per le serie TV "data uscita" mappa su first_air_date
      const field = (this.sortBy === 'release_date' && !this.isMovie) ? 'first_air_date' : this.sortBy;
      return `${field}.${this.sortOrder}`;
    },
    hasCinema() { return this.isMovie && this.providers.includes('cinema'); },
    realProviderIds() { return this.providers.filter((p) => p !== 'cinema'); },
  },
  methods: {
    async fetchItems() {
      this.loading = true;
      try {
        const params = { page: this.currentPage, sort_by: this.sortParam };
        if (this.genres.length) params.with_genres = this.genres.join(',');
        if (this.sortBy === 'vote_average') params['vote_count.gte'] = 200;

        if (this.hasCinema) {
          const today = new Date().toISOString().slice(0, 10);
          const from  = new Date(Date.now() - CINEMA_WINDOW_DAYS * 86400000).toISOString().slice(0, 10);
          params.with_release_type   = '2|3';
          params['release_date.gte'] = from;
          params['release_date.lte'] = today;
          params.region              = 'IT';
        }
        if (this.realProviderIds.length) {
          params.with_watch_providers = this.realProviderIds.join('|');
          params.watch_region         = 'IT';
        }

        const data = this.isMovie ? await discoverMovies(params) : await discoverTv(params);
        this.items = (data.results || []).filter(hasRequiredData);
        this.totalPages = Math.min(data.total_pages, 500);
      } catch (error) {
        console.error('Errore nel recupero dei contenuti:', error);
      } finally {
        this.loading = false;
      }
    },
    goToPage(page) {
      this.currentPage = page;
      this.fetchItems();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onGenresChange(val)    { this.genres = val;    this.currentPage = 1; this.fetchItems(); },
    onSortByChange(val)    { this.sortBy = val;    this.currentPage = 1; this.fetchItems(); },
    onSortOrderChange(val) { this.sortOrder = val; this.currentPage = 1; this.fetchItems(); },
    onProvidersChange(val) { this.providers = val; this.currentPage = 1; this.fetchItems(); },
  },
  async mounted() {
    const [, genres, providersList] = await Promise.all([
      this.fetchItems(),
      getGenres(this.mediaType),
      getWatchProvidersList(this.mediaType),
    ]);
    this.genresList = genres;
    // Solo i film hanno l'opzione "Al Cinema"
    this.providersList = this.isMovie
      ? [{ provider_id: 'cinema', provider_name: 'Al Cinema', logo_path: null }, ...providersList]
      : providersList;
  },
};
</script>

<template>
  <section class="container-browse">
    <div class="page-header">
      <h2>{{ title }}</h2>
      <SearchFilters
        :genres-list="genresList"
        :genres="genres"
        :sort-by="sortBy"
        :sort-order="sortOrder"
        :providers-list="providersList"
        :providers="providers"
        @update:genres="onGenresChange"
        @update:sort-by="onSortByChange"
        @update:sort-order="onSortOrderChange"
        @update:providers="onProvidersChange"
      />
    </div>
    <LoadingSkeleton v-if="loading" />
    <div v-else class="card-grid">
      <div v-for="item in items" :key="item.id">
        <MovieCard :item="item" :media-type="mediaType" />
      </div>
      <div v-for="n in 6" :key="'fill-' + n" class="card-fill" aria-hidden="true"></div>
    </div>
    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      @prev="goToPage(currentPage - 1)"
      @next="goToPage(currentPage + 1)"
    />
  </section>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;
@use '../assets/scss/partials/mixins' as *;

.container-browse { padding: 12vh 40px 40px; }

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: $space-md;
  margin-bottom: 24px;
  h2 { font-weight: 700; margin: 0; }
}

.card-grid { @include card-grid; }

.card-fill { visibility: hidden; pointer-events: none; }

@media (max-width: 768px) {
  .container-browse { padding: 12vh 16px 32px; }
  .page-header { flex-direction: column; align-items: flex-start; }
}
</style>
