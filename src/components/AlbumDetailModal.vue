<script>
import { getImageUrl } from '../utils/images.js';
import { useAlbumsStore } from '../stores/albums.js';
import { useFavoritesStore } from '../stores/favorites.js';

export default {
  name: 'AlbumDetailModal',
  props: {
    albumId: { type: [Number, String], default: null },
  },
  emits: ['close'],
  setup() {
    return {
      albums:    useAlbumsStore(),
      favorites: useFavoritesStore(),
    };
  },
  data() {
    return { confirmDelete: false };
  },
  computed: {
    album() {
      return this.albumId != null ? this.albums.getAlbum(this.albumId) : null;
    },
    itemsWithDetails() {
      if (!this.album) return [];
      return this.album.items.map((item) => {
        const fav = this.favorites.items.find(
          (f) => f.tmdb_id === item.tmdb_id && f.media_type === item.media_type
        );
        return {
          ...item,
          title:       fav?.title || `#${item.tmdb_id}`,
          poster_path: fav?.poster_path ?? null,
        };
      });
    },
  },
  methods: {
    getImageUrl,
    removeItem(item) {
      this.albums.removeItem(this.album.id, item.tmdb_id, item.media_type);
    },
    async doDelete() {
      await this.albums.deleteAlbum(this.album.id);
      this.$emit('close');
    },
  },
};
</script>

<template>
  <Teleport to="body">
    <div class="adm-overlay" @click.self="$emit('close')" role="dialog" aria-modal="true">
      <div class="adm-panel">

        <!-- Header -->
        <div class="adm-header">
          <div class="adm-title-row">
            <i class="fa-solid fa-folder-open adm-folder-icon"></i>
            <h2 class="adm-title">{{ album?.name }}</h2>
            <span class="adm-count">{{ itemsWithDetails.length }} element{{ itemsWithDetails.length === 1 ? 'o' : 'i' }}</span>
          </div>
          <button class="adm-close" @click="$emit('close')" aria-label="Chiudi">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Body: griglia item -->
        <div class="adm-body">
          <div v-if="itemsWithDetails.length === 0" class="adm-empty">
            <i class="fa-solid fa-photo-film"></i>
            <p>Nessun contenuto in questa cartella</p>
          </div>

          <div v-else class="adm-grid">
            <div
              v-for="item in itemsWithDetails"
              :key="item.media_type + '-' + item.tmdb_id"
              class="adm-item"
            >
              <div class="adm-poster">
                <img
                  v-if="item.poster_path"
                  :src="getImageUrl(item.poster_path, 'w300')"
                  :alt="item.title"
                  class="adm-img"
                  loading="lazy"
                />
                <div v-else class="adm-img adm-img--placeholder">
                  <i class="fa-solid fa-film"></i>
                </div>
                <button
                  class="adm-remove"
                  @click="removeItem(item)"
                  :aria-label="'Rimuovi ' + item.title"
                >
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
              <p class="adm-item-title">{{ item.title }}</p>
            </div>
          </div>
        </div>

        <!-- Footer: elimina album -->
        <div class="adm-footer">
          <template v-if="!confirmDelete">
            <button class="adm-btn-delete" @click="confirmDelete = true">
              <i class="fa-solid fa-trash"></i> Elimina cartella
            </button>
          </template>
          <template v-else>
            <span class="adm-confirm-text">Eliminare "{{ album?.name }}"?</span>
            <button class="adm-btn-confirm-yes" @click="doDelete">Sì, elimina</button>
            <button class="adm-btn-confirm-no"  @click="confirmDelete = false">Annulla</button>
          </template>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;

.adm-overlay {
  position: fixed;
  inset: 0;
  z-index: $z-modal;
  background: $color-overlay;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $space-md;
}

.adm-panel {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: $radius-md;
  width: 100%;
  max-width: 680px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// ── Header ─────────────────────────────────────────────────────────────────
.adm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-md $space-lg;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
  gap: $space-md;
}

.adm-title-row {
  display: flex;
  align-items: center;
  gap: $space-sm;
  min-width: 0;
}

.adm-folder-icon {
  color: $color-accent;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.adm-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.adm-count {
  font-size: 0.78rem;
  color: $color-text-dim;
  white-space: nowrap;
  flex-shrink: 0;
}

.adm-close {
  background: none;
  border: none;
  color: $color-text-dim;
  font-size: 1.1rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.15s, color 0.15s;

  &:hover { background-color: rgba(255, 255, 255, 0.1); color: $color-text; }
}

// ── Body ───────────────────────────────────────────────────────────────────
.adm-body {
  flex: 1;
  overflow-y: auto;
  padding: $space-lg;
}

.adm-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $space-md;
  padding: 60px $space-md;
  color: $color-text-dim;

  i { font-size: 2.5rem; opacity: 0.4; }
  p { margin: 0; font-size: 0.9rem; }
}

.adm-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, 1fr);

  @media (min-width: 480px)  { grid-template-columns: repeat(4, 1fr); }
  @media (min-width: 600px)  { grid-template-columns: repeat(5, 1fr); }
}

.adm-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.adm-poster {
  position: relative;
  aspect-ratio: 2 / 3;
  border-radius: $radius-sm;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.adm-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;

  &--placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.2);
    font-size: 1.5rem;
  }
}

.adm-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.75);
  color: $color-text;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, background-color 0.15s;

  .adm-poster:hover & { opacity: 1; }
  &:hover { background: rgba(219, 25, 39, 0.85); }
}

.adm-item-title {
  font-size: 0.68rem;
  color: $color-text-muted;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: center;
}

// ── Footer ─────────────────────────────────────────────────────────────────
.adm-footer {
  display: flex;
  align-items: center;
  gap: $space-sm;
  padding: $space-md $space-lg;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.adm-confirm-text {
  font-size: 0.88rem;
  color: $color-text-muted;
  flex: 1;
}

.adm-btn-delete {
  background: none;
  border: 1.5px solid rgba(219, 25, 39, 0.5);
  color: #ff6b78;
  border-radius: $radius-sm;
  padding: 7px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.15s, border-color 0.15s;

  &:hover { background-color: rgba(219, 25, 39, 0.12); border-color: $color-accent; }
}

.adm-btn-confirm-yes {
  background: $color-accent;
  border: none;
  color: $color-text;
  border-radius: $radius-sm;
  padding: 7px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover { opacity: 0.85; }
}

.adm-btn-confirm-no {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: $color-text-muted;
  border-radius: $radius-sm;
  padding: 7px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover { opacity: 0.75; }
}
</style>
