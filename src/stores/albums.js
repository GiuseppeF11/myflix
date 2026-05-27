import { defineStore } from 'pinia';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';
import { useAuthStore } from './auth.js';

function useRemote() {
  return isSupabaseConfigured && useAuthStore().user;
}

export const useAlbumsStore = defineStore('albums', {
  state: () => ({
    albums: [],   // [{ id, name, items: [{ tmdb_id, media_type, position }] }]
    loading: false,
  }),

  getters: {
    getAlbum: (state) => (id) => state.albums.find((a) => a.id === id) ?? null,
    isInAlbum: (state) => (albumId, tmdbId, mediaType) => {
      const album = state.albums.find((a) => a.id === albumId);
      return album?.items.some((i) => i.tmdb_id === tmdbId && i.media_type === mediaType) ?? false;
    },
  },

  actions: {
    async load() {
      if (!useRemote()) return;
      this.loading = true;
      try {
        const { data: albumRows, error: aErr } = await supabase
          .from('albums')
          .select('id, name, created_at')
          .order('created_at', { ascending: true });
        if (aErr) throw aErr;

        const { data: itemRows, error: iErr } = await supabase
          .from('album_items')
          .select('album_id, tmdb_id, media_type, position');
        if (iErr) throw iErr;

        this.albums = (albumRows || []).map((a) => ({
          ...a,
          items: (itemRows || [])
            .filter((i) => i.album_id === a.id)
            .sort((a, b) => a.position - b.position),
        }));
      } catch (e) {
        console.error('Errore caricamento album:', e);
      } finally {
        this.loading = false;
      }
    },

    async createAlbum(name) {
      if (!useRemote()) return null;
      const { data, error } = await supabase
        .from('albums')
        .insert({ name, user_id: useAuthStore().user.id })
        .select('id, name, created_at')
        .single();
      if (error) { console.error('Errore creazione album:', error); return null; }
      const newAlbum = { ...data, items: [] };
      this.albums.push(newAlbum);
      return newAlbum;
    },

    async deleteAlbum(id) {
      if (!useRemote()) return;
      const { error } = await supabase.from('albums').delete().eq('id', id).eq('user_id', useAuthStore().user.id);
      if (error) { console.error('Errore eliminazione album:', error); return; }
      this.albums = this.albums.filter((a) => a.id !== id);
    },

    async renameAlbum(id, name) {
      if (!useRemote()) return;
      const { error } = await supabase.from('albums').update({ name }).eq('id', id).eq('user_id', useAuthStore().user.id);
      if (error) { console.error('Errore rinomina album:', error); return; }
      const album = this.albums.find((a) => a.id === id);
      if (album) album.name = name;
    },

    async addItems(albumId, items) {
      // items: [{ tmdb_id, media_type }]
      if (!useRemote()) return;
      const userId = useAuthStore().user.id;
      const album  = this.albums.find((a) => a.id === albumId);
      if (!album) return;

      const newItems = items.filter(
        (it) => !album.items.some((ex) => ex.tmdb_id === it.tmdb_id && ex.media_type === it.media_type)
      );
      if (!newItems.length) return;

      const position = album.items.length;
      const rows = newItems.map((it, i) => ({
        album_id:   albumId,
        user_id:    userId,
        tmdb_id:    it.tmdb_id,
        media_type: it.media_type,
        position:   position + i,
      }));

      const { error } = await supabase
        .from('album_items')
        .upsert(rows, { onConflict: 'album_id,tmdb_id,media_type' });
      if (error) { console.error('Errore aggiunta item ad album:', error); return; }

      newItems.forEach((it, i) => album.items.push({ ...it, position: position + i }));
    },

    async removeItem(albumId, tmdbId, mediaType) {
      if (!useRemote()) return;
      const { error } = await supabase
        .from('album_items')
        .delete()
        .match({ album_id: albumId, tmdb_id: tmdbId, media_type: mediaType });
      if (error) { console.error('Errore rimozione item da album:', error); return; }
      const album = this.albums.find((a) => a.id === albumId);
      if (album) album.items = album.items.filter((i) => !(i.tmdb_id === tmdbId && i.media_type === mediaType));
    },

    /**
     * Rimuove un item da TUTTI gli album (chiamato quando il preferito viene eliminato).
     * Una sola query Supabase grazie all'RLS che filtra già per user_id.
     */
    async removeItemFromAllAlbums(tmdbId, mediaType) {
      if (!useRemote()) return;
      const { error } = await supabase
        .from('album_items')
        .delete()
        .match({ user_id: useAuthStore().user.id, tmdb_id: tmdbId, media_type: mediaType });
      if (error) { console.error('Errore pulizia item dagli album:', error); return; }
      // Aggiorna lo stato locale
      this.albums.forEach((album) => {
        album.items = album.items.filter(
          (i) => !(i.tmdb_id === tmdbId && i.media_type === mediaType)
        );
      });
    },
  },
});
