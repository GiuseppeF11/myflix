import { defineStore } from 'pinia';
import {
  searchMovies, searchTv, discoverMovies, discoverTv,
  getGenres, getWatchProviders, getWatchProvidersList,
  searchPerson,
} from '../services/tmdb.js';
import { hasRequiredData } from '../utils/media.js';

const CINEMA_WINDOW_DAYS = 90;

export const useSearchStore = defineStore('search', {
  state: () => ({
    text: '',
    movies: [],
    series: [],
    filter: 'all',   // 'all' | 'movie' | 'tv'
    loading: false,

    // Modalità di ricerca: 'title' (titoli) | 'cast' (attori)
    searchMode: 'title',
    // In modalità cast: suggerimenti attori per il dropdown (foto + nome)
    personSuggestions: [],

    // Filtri avanzati
    genres: [],
    sortBy: 'popularity',
    sortOrder: 'desc',

    // Filtro piattaforma
    providers: [],       // ID selezionati (può includere 'cinema')
    providersList: [],   // Lista completa per IT (movie + tv, deduplicati)

    // Lista completa generi
    genresList: [],
  }),

  getters: {
    visibleMovies: (state) => state.filter !== 'tv'    ? state.movies : [],
    visibleSeries: (state) => state.filter !== 'movie' ? state.series : [],
    totalCount:    (state) => state.movies.length + state.series.length,
    hasResults:    (state) => state.movies.length > 0 || state.series.length > 0,
    isCastMode:    (state) => state.searchMode === 'cast',
    sortParam:     (state) => `${state.sortBy}.${state.sortOrder}`,
    hasActiveFilters: (state) =>
      state.genres.length > 0 ||
      state.providers.length > 0 ||
      state.sortBy !== 'popularity' ||
      state.sortOrder !== 'desc',
    hasCinema: (state) => state.providers.includes('cinema'),
    realProviderIds: (state) => state.providers.filter((p) => p !== 'cinema'),
  },

  actions: {
    /** Carica la lista completa di generi (film + serie, deduplicati per id). */
    async fetchGenres() {
      if (this.genresList.length > 0) return;
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

    /** Carica la lista provider per IT (movie + tv, deduplicati per provider_id). */
    async fetchProviders() {
      if (this.providersList.length > 0) return;
      try {
        const [movieProviders, tvProviders] = await Promise.all([
          getWatchProvidersList('movie'),
          getWatchProvidersList('tv'),
        ]);
        const map = new Map();
        [...movieProviders, ...tvProviders].forEach((p) => map.set(p.provider_id, p));
        const sorted = [...map.values()].sort((a, b) => a.display_priority - b.display_priority);
        this.providersList = [
          { provider_id: 'cinema', provider_name: 'Al Cinema', logo_path: null },
          ...sorted,
        ];
      } catch (e) {
        console.error('Errore caricamento provider:', e);
      }
    },

    setFilter(value)     { this.filter     = value; },
    setGenres(ids)       { this.genres     = ids;   },
    setSortBy(value)     { this.sortBy      = value; },
    setSortOrder(value)  { this.sortOrder   = value; },
    setProviders(ids)    { this.providers   = ids;   },
    setSearchMode(value) {
      this.searchMode = value;
      // Pulisce i dati della modalità precedente
      if (value === 'cast') { this.movies = []; this.series = []; }
      else { this.personSuggestions = []; }
    },

    resetFilters() {
      this.genres    = [];
      this.sortBy    = 'popularity';
      this.sortOrder = 'desc';
      this.providers = [];
    },

    async run() {
      const hasText      = this.text.trim() !== '';
      const hasGenres    = this.genres.length > 0;
      const hasProviders = this.providers.length > 0;

      // ── Modalità CAST: la barra propone i suggerimenti attori (dropdown) ──
      if (this.searchMode === 'cast') {
        this.movies = [];
        this.series = [];
        await this.fetchSuggestions();
        return;
      }

      // ── Modalità TITOLO ──────────────────────────────────────────────────
      if (!hasText && !hasGenres && !hasProviders) {
        this.movies = [];
        this.series = [];
        this.filter = 'all';
        return;
      }

      this.loading = true;
      try {
        if (hasText) {
          // ── Ricerca testuale per titolo ───────────────────────────────────
          const [moviesRes, seriesRes] = await Promise.all([
            searchMovies(this.text),
            searchTv(this.text),
          ]);
          let movies = moviesRes.results || [];
          let series = seriesRes.results || [];

          // Filtro genere client-side
          if (hasGenres) {
            movies = movies.filter((m) => this.genres.some((gId) => m.genre_ids?.includes(gId)));
            series = series.filter((s) => this.genres.some((gId) => s.genre_ids?.includes(gId)));
          }

          // Filtro provider client-side (batch fetch, max 20 risultati per tipo)
          if (hasProviders) {
            [movies, series] = await this._filterByProviders(movies, series);
          }

          if (this.sortBy === 'vote_average') {
            movies = movies.filter((m) => (m.vote_count || 0) >= 100);
            series = series.filter((s) => (s.vote_count || 0) >= 100);
          }

          movies = movies.filter(hasRequiredData);
          series = series.filter(hasRequiredData);

          const sortFn = this._getSortFn();
          this.movies = movies.sort(sortFn);
          this.series = series.sort(sortFn);

        } else {
          // ── Solo filtri (generi / provider) → discover ───────────────────
          const movieParams = { sort_by: this.sortParam };
          const tvParams    = { sort_by: this.sortParam };

          if (hasGenres) {
            movieParams.with_genres = this.genres.join(',');
            tvParams.with_genres    = this.genres.join(',');
          }
          if (this.sortBy === 'vote_average') {
            movieParams['vote_count.gte'] = 200;
            tvParams['vote_count.gte']    = 200;
          }

          if (hasProviders) {
            if (this.hasCinema) {
              const today = new Date().toISOString().slice(0, 10);
              const from  = new Date(Date.now() - CINEMA_WINDOW_DAYS * 86400000).toISOString().slice(0, 10);
              movieParams.with_release_type   = '2|3';
              movieParams['release_date.gte'] = from;
              movieParams['release_date.lte'] = today;
              movieParams.region              = 'IT';
            }
            if (this.realProviderIds.length) {
              movieParams.with_watch_providers = this.realProviderIds.join('|');
              movieParams.watch_region         = 'IT';
              tvParams.with_watch_providers    = this.realProviderIds.join('|');
              tvParams.watch_region            = 'IT';
            }
          }

          const [moviesRes, seriesRes] = await Promise.all([
            this.filter !== 'tv'    ? discoverMovies(movieParams) : Promise.resolve({ results: [] }),
            this.filter !== 'movie' ? discoverTv(tvParams)        : Promise.resolve({ results: [] }),
          ]);
          this.movies = (moviesRes.results || []).filter(hasRequiredData);
          this.series = (seriesRes.results || []).filter(hasRequiredData);
        }

        if (this.filter === 'movie' && this.movies.length === 0) this.filter = 'all';
        if (this.filter === 'tv'    && this.series.length === 0) this.filter = 'all';
      } catch (error) {
        console.error('Errore nella ricerca:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Filtra movies e series client-side in base ai provider selezionati.
     * Fa una chiamata getWatchProviders per ciascun item (batched, max 5 per volta).
     */
    async _filterByProviders(movies, series) {
      const realIds  = this.realProviderIds;
      const hasCinema = this.hasCinema;

      const checkItem = async (item, mediaType) => {
        try {
          const p = await getWatchProviders(item.id, mediaType);
          const flatrateIds = (p?.flatrate || []).map((x) => x.provider_id);
          if (hasCinema) {
            // "Cinema": item incluso se ha una data di uscita recente (approssimazione)
            const releaseDate = item.release_date || item.first_air_date || '';
            if (releaseDate) {
              const daysAgo = (Date.now() - new Date(releaseDate).getTime()) / 86400000;
              if (daysAgo >= 0 && daysAgo <= CINEMA_WINDOW_DAYS) return true;
            }
          }
          if (realIds.length > 0) {
            return realIds.some((id) => flatrateIds.includes(id));
          }
          return hasCinema; // già gestito sopra
        } catch {
          return false;
        }
      };

      const batchFilter = async (items, mediaType) => {
        const results = [];
        for (let i = 0; i < items.length; i += 5) {
          const batch = items.slice(i, i + 5);
          const flags = await Promise.all(batch.map((it) => checkItem(it, mediaType)));
          batch.forEach((it, idx) => { if (flags[idx]) results.push(it); });
        }
        return results;
      };

      return Promise.all([
        batchFilter(movies, 'movie'),
        batchFilter(series, 'tv'),
      ]);
    },

    /**
     * Modalità cast: popola personSuggestions con gli attori il cui nome contiene
     * il testo digitato (con foto, deduplicati, max 8). Usato dal dropdown della barra.
     */
    async fetchSuggestions() {
      const q = this.text.trim();
      if (this.searchMode !== 'cast' || q.length < 2) {
        this.personSuggestions = [];
        return;
      }
      try {
        const persons = await searchPerson(q);
        const norm = (s) =>
          (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
        const nq = norm(q);
        const seen = new Set();
        this.personSuggestions = persons
          .filter((p) => {
            if (!p.profile_path || !norm(p.name).includes(nq)) return false;
            if (seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
          })
          .slice(0, 8);
      } catch {
        this.personSuggestions = [];
      }
    },

    clearSuggestions() { this.personSuggestions = []; },

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
        default:
          return (a, b) => ((a.popularity || 0) - (b.popularity || 0)) * order;
      }
    },
  },
});
