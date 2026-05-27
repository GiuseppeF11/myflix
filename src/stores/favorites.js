import { defineStore } from 'pinia';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';
import { useAuthStore }   from './auth.js';
import { useAlbumsStore } from './albums.js';

const STORAGE_KEY = 'myflix:favorites';

// Forma unica e normalizzata di un preferito, indipendente da quale
// componente lo aggiunge (risolve l'incoerenza dei dati tra le viste).
export function normalizeItem(raw, mediaType) {
  const media_type = mediaType || (raw.title ? 'movie' : 'tv');
  return {
    tmdb_id: raw.id ?? raw.tmdb_id,
    media_type,
    title: raw.title || raw.name || '',
    poster_path: raw.poster_path ?? null,
    overview: raw.overview ?? '',
  };
}

// Vero solo se Supabase è configurato E l'utente è autenticato.
function useRemote() {
  return isSupabaseConfigured && useAuthStore().user;
}

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    items: [],
    loading: false,
  }),
  getters: {
    count: (state) => state.items.length,
    isFavorite: (state) => (tmdbId, mediaType) =>
      state.items.some((i) => i.tmdb_id === tmdbId && i.media_type === mediaType),
  },
  actions: {
    loadLocal() {
      try {
        this.items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      } catch {
        this.items = [];
      }
    },
    persistLocal() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    },
    async load() {
      if (!useRemote()) {
        this.loadLocal();
        return;
      }
      this.loading = true;
      const { data, error } = await supabase
        .from('favorites')
        .select('tmdb_id, media_type, title, poster_path, overview')
        .order('created_at', { ascending: false });
      this.loading = false;
      if (error) {
        console.error('Errore nel caricamento dei preferiti:', error);
        return;
      }
      this.items = data;
    },
    async add(raw, mediaType) {
      const item = normalizeItem(raw, mediaType);
      if (this.isFavorite(item.tmdb_id, item.media_type)) return;
      this.items.push(item);
      if (useRemote()) {
        const { error } = await supabase
          .from('favorites')
          .insert({ ...item, user_id: useAuthStore().user.id });
        if (error) console.error('Errore aggiunta preferito:', error);
      } else {
        this.persistLocal();
      }
    },
    async remove(tmdbId, mediaType) {
      this.items = this.items.filter(
        (i) => !(i.tmdb_id === tmdbId && i.media_type === mediaType)
      );
      if (useRemote()) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .match({ user_id: useAuthStore().user.id, tmdb_id: tmdbId, media_type: mediaType });
        if (error) console.error('Errore rimozione preferito:', error);
        // Rimuovi il titolo anche da tutti gli album (fire-and-forget)
        useAlbumsStore().removeItemFromAllAlbums(tmdbId, mediaType);
      } else {
        this.persistLocal();
      }
    },
    toggle(raw, mediaType) {
      const item = normalizeItem(raw, mediaType);
      if (this.isFavorite(item.tmdb_id, item.media_type)) {
        this.remove(item.tmdb_id, item.media_type);
      } else {
        this.add(raw, mediaType);
      }
    },
    // Al login: carica i preferiti locali su Supabase, poi ricarica dal DB.
    async mergeLocalIntoRemote() {
      if (!useRemote()) return;
      this.loadLocal();
      if (this.items.length) {
        const rows = this.items.map((i) => ({ ...i, user_id: useAuthStore().user.id }));
        const { error } = await supabase
          .from('favorites')
          .upsert(rows, { onConflict: 'user_id,tmdb_id,media_type' });
        if (error) console.error('Errore nel merge dei preferiti:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
      await this.load();
    },
  },
});
