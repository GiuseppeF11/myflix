import { defineStore } from 'pinia';
import { searchMovies, searchTv, discoverMovies, discoverTv, getGenres } from '../services/tmdb.js';
import { hasRequiredData } from '../utils/media.js';

export const useSearchStore = defineStore('search', {
  state: () => ({
    text: '',
    movies: [],
    series: [],
    filter: 'all',   // 'all' | 'movie' | 'tv'
    loading: false,

    // Filtri avanzati
    genres: [],          // IDs selezionati (multi-select)
    sortBy: 'popularity', // 'popularity' | 'release_date' | 'vote_average'
    sortOrder: 'desc',   // 'asc' | 'desc'

    // Lista completa generi caricata da TMDB
    genresList: [],
  }),

  getters: {
    visibleMovies: (state) => state.filter !== 'tv'    ? state.movies : [],
    visibleSeries: (state) => state.filter !== 'movie' ? state.series : [],
    totalCount:    (state) => state.movies.length + state.series.length,
    hasResults:    (state) => state.movies.length > 0 || state.series.length > 0,
    sortParam:     (state) => `${state.sortBy}.${state.sortOrder}`,
    hasActiveFilters: (state) => state.genres.length > 0 || state.sortBy !== 'popularity' || state.sortOrder !== 'desc',
  },

  actions: {
    /** Carica la lista completa di generi (film + serie, deduplicati per id). */
    async fetchGenres() {
      if (this.genresList.length > 0) return; // già caricati
      try {
        const [movieGenres, tvGenres] = await Promise.all([
          getGenres('movie'),
          getGenres('tv'),
        ]);
        const map = new Map();
        [...movieGenres, ...tvGenres].forEach((g) => map.set(g.id, g));
        this.genresList = [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
      } catch (e) {
        console.error('Errore caricamento generi:', e);
      }
    },

    setFilter(value)    { this.filter    = value; },
    setGenres(ids)      { this.genres    = ids;    },
    setSortBy(value)    { this.sortBy    = value;  },
    setSortOrder(value) { this.sortOrder = value;  },

    resetFilters() {
      this.genres    = [];
      this.sortBy    = 'popularity';
      this.sortOrder = 'desc';
    },

    async run() {
      const hasText   = this.text.trim() !== '';
      const hasGenres = this.genres.length > 0;

      // Nessun testo e nessun genere → svuota tutto
      if (!hasText && !hasGenres) {
        this.movies = [];
        this.series = [];
        this.filter = 'all';
        return;
      }

      this.loading = true;
      try {
        if (hasText) {
          // Ricerca full-text → API search, poi filtro client-side per genere
          const [moviesRes, seriesRes] = await Promise.all([
            searchMovies(this.text),
            searchTv(this.text),
          ]);
          let movies = moviesRes.results || [];
          let series = seriesRes.results || [];

          if (hasGenres) {
            movies = movies.filter((m) =>
              this.genres.some((gId) => m.genre_ids?.includes(gId))
            );
            series = series.filter((s) =>
              this.genres.some((gId) => s.genre_ids?.includes(gId))
            );
          }

          // Se si ordina per valutazione, escludi titoli con pochi voti
          if (this.sortBy === 'vote_average') {
            movies = movies.filter((m) => (m.vote_count || 0) >= 100);
            series = series.filter((s) => (s.vote_count || 0) >= 100);
          }

          // Filtra dati sporchi prima dell'ordinamento
          movies = movies.filter(hasRequiredData);
          series = series.filter(hasRequiredData);

          // Ordinamento client-side per ricerca testuale
          const sortFn = this._getSortFn();
          this.movies = movies.sort(sortFn);
          this.series = series.sort(sortFn);
        } else {
          // Solo generi (nessun testo) → discover API con ordinamento server-side
          const params = {
            with_genres: this.genres.join(','),
            sort_by: this.sortParam,
          };
          // Quando si ordina per valutazione, richiedi un numero minimo di voti
          // per escludere titoli con poche recensioni e punteggi falsati.
          if (this.sortBy === 'vote_average') params['vote_count.gte'] = 200;
          const [moviesRes, seriesRes] = await Promise.all([
            this.filter !== 'tv'    ? discoverMovies(params) : Promise.resolve({ results: [] }),
            this.filter !== 'movie' ? discoverTv(params)     : Promise.resolve({ results: [] }),
          ]);
          this.movies = (moviesRes.results || []).filter(hasRequiredData);
          this.series = (seriesRes.results || []).filter(hasRequiredData);
        }

        // Auto-reset filtro tipo se non ci sono risultati per quella categoria
        if (this.filter === 'movie' && this.movies.length === 0) this.filter = 'all';
        if (this.filter === 'tv'    && this.series.length === 0) this.filter = 'all';
      } catch (error) {
        console.error('Errore nella ricerca:', error);
      } finally {
        this.loading = false;
      }
    },

    /** Funzione di comparazione per ordinamento client-side. */
    _getSortFn() {
      const order = this.sortOrder === 'asc' ? 1 : -1;
      switch (this.sortBy) {
        case 'release_date':
          return (a, b) => {
            const da = a.release_date || a.first_air_date || '';
            const db = b.release_date || b.first_air_date || '';
            return da < db ? -order : da > db ? order : 0;
          };
        case 'vote_average':
          return (a, b) => ((a.vote_average || 0) - (b.vote_average || 0)) * order;
        default: // popularity
          return (a, b) => ((a.popularity || 0) - (b.popularity || 0)) * order;
      }
    },
  },
});
