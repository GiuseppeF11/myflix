import { defineStore } from 'pinia';
import { searchMovies, searchTv } from '../services/tmdb.js';

export const useSearchStore = defineStore('search', {
  state: () => ({
    text: '',
    movies: [],
    series: [],
    filter: 'all', // 'all' | 'movie' | 'tv'
    loading: false,
  }),
  getters: {
    // Risultati visibili in base al filtro attivo
    visibleMovies: (state) =>
      state.filter !== 'tv' ? state.movies : [],
    visibleSeries: (state) =>
      state.filter !== 'movie' ? state.series : [],
    totalCount: (state) => state.movies.length + state.series.length,
    hasResults: (state) => state.movies.length > 0 || state.series.length > 0,
  },
  actions: {
    async run() {
      if (this.text.trim() === '') {
        this.movies = [];
        this.series = [];
        this.filter = 'all';
        return;
      }
      this.loading = true;
      try {
        const [movies, series] = await Promise.all([
          searchMovies(this.text),
          searchTv(this.text),
        ]);
        this.movies = movies.results || [];
        this.series = series.results || [];

        // Se il filtro attivo non ha risultati, torna su "tutti"
        if (this.filter === 'movie' && this.movies.length === 0) this.filter = 'all';
        if (this.filter === 'tv' && this.series.length === 0) this.filter = 'all';
      } catch (error) {
        console.error('Errore nella ricerca:', error);
      } finally {
        this.loading = false;
      }
    },
    setFilter(value) {
      this.filter = value;
    },
  },
});
