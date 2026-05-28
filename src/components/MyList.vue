<script>
import { useFavoritesStore }    from '../stores/favorites.js';
import { useAuthStore }         from '../stores/auth.js';
import { useAlbumsStore }       from '../stores/albums.js';
import { useSearchStore }       from '../stores/search.js';
import { isSupabaseConfigured } from '../services/supabase.js';
import { getWatchProviders, getGenres, getItemGenreIds } from '../services/tmdb.js';

import MovieCard        from './MovieCard.vue';
import AlbumCard        from './AlbumCard.vue';
import EmptyState       from './EmptyState.vue';
import AuthModal        from './AuthModal.vue';
import SearchFilters    from './SearchFilters.vue';
import CreateAlbumModal from './CreateAlbumModal.vue';
import AlbumDetailModal from './AlbumDetailModal.vue';
import PageLoader       from './PageLoader.vue';
import LoadingSkeleton  from './LoadingSkeleton.vue';

export default {
  name: 'MyList',
  components: {
    MovieCard, AlbumCard, EmptyState, AuthModal,
    SearchFilters, CreateAlbumModal, AlbumDetailModal,
    PageLoader, LoadingSkeleton,
  },
  setup() {
    return {
      favorites:   useFavoritesStore(),
      auth:        useAuthStore(),
      albums:      useAlbumsStore(),
      searchStore: useSearchStore(),
    };
  },
  data() {
    return {
      showAuth:          false,
      authInitialMode:   'login',
      supabaseEnabled:   isSupabaseConfigured,

      // Filtri
      typeFilter:        'all',
      sortBy:            'default',
      sortOrder:         'desc',
      selectedGenres:    [],
      genresList:        [],
      genreCache:        {},          // { 'tmdb_id:media_type': [genre_id, …] }
      loadingGenres:     false,
      providerFilter:    [],
      providerCache:     {},          // { 'tmdb_id:media_type': [provider_id, …] }
      loadingProviders:  false,

      // Modalità selezione
      selectMode:        false,
      selectedItems:     [],          // [{ tmdb_id, media_type }]

      // Album UI
      showCreateAlbum:   false,
      createAndMoveMode: false,
      openAlbumId:       null,
      showMoveDropdown:  false,

      // Touch drag (highlight reattivo)
      touchDragOverAlbumId: null,
    };
  },

  computed: {
    requiresLogin() { return this.supabaseEnabled && !this.auth.isLoggedIn; },
    showAlbums() { return true; }, // visibili per tutti i filtri

    // Applica generi + provider ma NON typeFilter.
    // Serve per calcolare i contatori dei chip indipendentemente dal tipo selezionato.
    filteredItemsBase() {
      let items = this.favorites.items;
      if (this.selectedGenres.length > 0) {
        items = items.filter((item) => {
          const key = `${item.tmdb_id}:${item.media_type}`;
          const ids = this.genreCache[key];
          if (!ids) return false;
          return this.selectedGenres.some((gid) => ids.includes(gid));
        });
      }
      if (this.providerFilter.length > 0) {
        items = items.filter((item) => {
          const key = `${item.tmdb_id}:${item.media_type}`;
          const ids = this.providerCache[key];
          if (!ids) return false;
          return this.providerFilter.some((pid) => ids.includes(pid));
        });
      }
      return items;
    },

    filterChips() {
      const base = this.filteredItemsBase;
      return [
        { value: 'all',   label: 'Tutti',    count: base.length },
        { value: 'movie', label: 'Film',     count: base.filter((i) => i.media_type === 'movie').length },
        { value: 'tv',    label: 'Serie TV', count: base.filter((i) => i.media_type === 'tv').length },
      ];
    },

    filteredItems() {
      let items = this.filteredItemsBase;
      if (this.typeFilter !== 'all') {
        items = items.filter((i) => i.media_type === this.typeFilter);
      }
      // Ordinamento client-side
      if (this.sortBy === 'title') {
        items = [...items].sort((a, b) => {
          const cmp = (a.title || '').localeCompare(b.title || '', 'it', { sensitivity: 'base' });
          return this.sortOrder === 'asc' ? cmp : -cmp;
        });
      } else if (this.sortBy === 'default' && this.sortOrder === 'asc') {
        items = [...items].reverse();
      }
      return items;
    },
    providersListForMyList() {
      return this.searchStore.providersList.filter((p) => p.provider_id !== 'cinema');
    },
    sortOptionsForMyList() {
      return [
        { value: 'default', label: 'Aggiunti di recente' },
        { value: 'title',   label: 'Titolo'              },
      ];
    },
  },

  mounted() {
    this.albums.load();
    this.searchStore.fetchProviders();
    this.loadGenreList();
    document.addEventListener('click', this.onOutsideClick);

    // Stato non-reattivo per touch drag + long press
    this._drag          = { active: false, startX: 0, startY: 0, item: null, ghostEl: null };
    this._onDragMove    = (e) => this._touchDragMove(e);
    this._onDragUp      = (e) => this._touchDragEnd(e);
    this._longPressTimer = null;
  },
  beforeUnmount() {
    document.removeEventListener('click',        this.onOutsideClick);
    document.removeEventListener('pointermove',   this._onDragMove);
    document.removeEventListener('pointerup',     this._onDragUp);
    document.removeEventListener('pointercancel', this._onDragUp);
    clearTimeout(this._longPressTimer);
    this._cleanupGhost();
  },

  methods: {
    openLogin(mode = 'login') { this.authInitialMode = mode; this.showAuth = true; },

    // ── Filtri ──────────────────────────────────────────────────────────────
    setTypeFilter(value) {
      this.typeFilter = value;
      if (this.selectMode) {
        this.selectMode = false; this.selectedItems = []; this.showMoveDropdown = false;
      }
    },
    async loadGenreList() {
      try {
        const [movieGenres, tvGenres] = await Promise.all([getGenres('movie'), getGenres('tv')]);
        const seen = new Set();
        this.genresList = [...movieGenres, ...tvGenres]
          .filter((g) => { if (seen.has(g.id)) return false; seen.add(g.id); return true; })
          .sort((a, b) => a.name.localeCompare(b.name, 'it'));
      } catch {}
    },
    async onGenresChange(val) {
      this.selectedGenres = val;
      if (!val.length) return;
      const toFetch = this.favorites.items.filter((item) => {
        const key = `${item.tmdb_id}:${item.media_type}`;
        return !(key in this.genreCache);
      });
      if (!toFetch.length) return;
      this.loadingGenres = true;
      try {
        for (let i = 0; i < toFetch.length; i += 5) {
          await Promise.all(
            toFetch.slice(i, i + 5).map(async (item) => {
              const key = `${item.tmdb_id}:${item.media_type}`;
              try {
                this.genreCache[key] = await getItemGenreIds(item.tmdb_id, item.media_type);
              } catch { this.genreCache[key] = []; }
            })
          );
        }
      } finally { this.loadingGenres = false; }
    },

    onSortByChange(val)    { this.sortBy = val; },
    onSortOrderChange(val) { this.sortOrder = val; },

    async onProvidersChange(val) {
      this.providerFilter = val;
      if (!val.length) return;
      const toFetch = this.favorites.items.filter((item) => {
        const key = `${item.tmdb_id}:${item.media_type}`;
        return !(key in this.providerCache);
      });
      if (!toFetch.length) return;
      this.loadingProviders = true;
      try {
        for (let i = 0; i < toFetch.length; i += 5) {
          await Promise.all(
            toFetch.slice(i, i + 5).map(async (item) => {
              const key = `${item.tmdb_id}:${item.media_type}`;
              try {
                const p = await getWatchProviders(item.tmdb_id, item.media_type);
                this.providerCache[key] = (p?.flatrate || []).map((x) => x.provider_id);
              } catch { this.providerCache[key] = []; }
            })
          );
        }
      } finally { this.loadingProviders = false; }
    },

    // ── Select mode ─────────────────────────────────────────────────────────
    toggleSelectMode() {
      this.selectMode = !this.selectMode;
      if (!this.selectMode) { this.selectedItems = []; this.showMoveDropdown = false; }
    },
    isSelected(item) {
      return this.selectedItems.some(
        (s) => s.tmdb_id === item.tmdb_id && s.media_type === item.media_type
      );
    },
    onToggleSelect(item) {
      if (this.isSelected(item)) {
        this.selectedItems = this.selectedItems.filter(
          (s) => !(s.tmdb_id === item.tmdb_id && s.media_type === item.media_type)
        );
      } else {
        this.selectedItems.push(item);
      }
    },
    deselectAll() { this.selectedItems = []; },

    // ── Album actions ────────────────────────────────────────────────────────
    onDropItems(albumId, items) { this.albums.addItems(albumId, items); },
    async moveToAlbum(albumId) {
      await this.albums.addItems(albumId, this.selectedItems);
      this.selectedItems = []; this.selectMode = false; this.showMoveDropdown = false;
    },
    openCreateAlbum() { this.createAndMoveMode = false; this.showCreateAlbum = true; },
    openCreateAlbumAndMove() { this.createAndMoveMode = true; this.showCreateAlbum = true; this.showMoveDropdown = false; },
    async onAlbumCreated(name) {
      const album = await this.albums.createAlbum(name);
      this.showCreateAlbum = false;
      if (this.createAndMoveMode && album) await this.moveToAlbum(album.id);
    },
    onAlbumRename(albumId, name) { this.albums.renameAlbum(albumId, name); },

    onOutsideClick(e) {
      if (this.showMoveDropdown && this.$refs.moveDropdown && !this.$refs.moveDropdown.contains(e.target)) {
        this.showMoveDropdown = false;
      }
    },

    // ── Touch Drag (pointer events – funziona su mobile e desktop) ──────────
    /**
     * Avvio del drag da touch/penna (non mouse – quello usa HTML5 DnD nativo).
     * Ascolta pointermove + pointerup a livello document per seguire il dito
     * anche fuori dalla card di partenza.
     */
    /**
     * Gestisce long-press + drag per mouse, touch e penna.
     * Ignora tocchi secondari (multi-touch).
     */
    onCardPointerStart(e, item) {
      if (!e.isPrimary) return; // ignora dita aggiuntive in multi-touch

      this._drag.startX = e.clientX;
      this._drag.startY = e.clientY;
      this._drag.item   = item;
      this._drag.active = false;

      // Long press → entra in select mode e seleziona la card corrente
      if (!this.selectMode) {
        clearTimeout(this._longPressTimer);
        this._longPressTimer = setTimeout(() => {
          this._longPressTimer = null;
          this.selectMode  = true;
          this.selectedItems = [{ tmdb_id: item.tmdb_id, media_type: item.media_type }];
          navigator.vibrate?.(50); // feedback aptico se supportato
        }, 500);
      }

      document.addEventListener('pointermove',   this._onDragMove, { passive: false });
      document.addEventListener('pointerup',    this._onDragUp);
      document.addEventListener('pointercancel', this._onDragUp); // cleanup se il browser interrompe il touch
    },

    _touchDragMove(e) {
      const d  = this._drag;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;

      // Se il dito si muove troppo prima dei 500ms, annulla il long press
      if (this._longPressTimer && Math.hypot(dx, dy) > 6) {
        clearTimeout(this._longPressTimer);
        this._longPressTimer = null;
      }

      // Il drag visuale è disponibile solo in modalità selezione
      if (!this.selectMode) return;

      if (!d.active) {
        if (Math.hypot(dx, dy) < 8) return;
        d.active = true;
        this._createGhost(e, d.item);
      }

      e.preventDefault(); // blocca lo scroll durante il drag

      if (d.ghostEl) {
        d.ghostEl.style.left = (e.clientX - 26) + 'px';
        d.ghostEl.style.top  = (e.clientY - 34) + 'px';
      }

      // Individua l'album sotto il dito (ghost ha pointer-events:none, non interferisce)
      const below   = document.elementFromPoint(e.clientX, e.clientY);
      const albumEl = below?.closest('[data-album-id]');
      this.touchDragOverAlbumId = albumEl ? +albumEl.dataset.albumId : null;
    },

    _touchDragEnd(e) {
      // Annulla sempre il long press timer al sollevamento del dito
      clearTimeout(this._longPressTimer);
      this._longPressTimer = null;

      document.removeEventListener('pointermove',   this._onDragMove);
      document.removeEventListener('pointerup',    this._onDragUp);
      document.removeEventListener('pointercancel', this._onDragUp);

      const d = this._drag;
      if (d.active && this.touchDragOverAlbumId != null) {
        const toDrop = this.isSelected(d.item) && this.selectedItems.length > 0
          ? [...this.selectedItems]
          : [d.item];
        this.albums.addItems(this.touchDragOverAlbumId, toDrop);
        if (this.isSelected(d.item)) {
          this.selectedItems = [];
          this.selectMode    = false;
        }
      }

      this._cleanupGhost();
    },

    _createGhost(e, item) {
      // Rimuovi sempre qualsiasi ghost residuo prima di crearne uno nuovo
      if (this._drag?.ghostEl) {
        this._drag.ghostEl.remove();
        this._drag.ghostEl = null;
      }

      const count = this.isSelected(item) && this.selectedItems.length > 0
        ? this.selectedItems.length : 1;
      const el = document.createElement('div');
      el.innerHTML = count > 1
        ? `<span>${count}</span>`
        : '<i class="fa-solid fa-film"></i>';
      Object.assign(el.style, {
        position:      'fixed',
        zIndex:        '9999',
        pointerEvents: 'none',
        width:         '52px',
        height:        '68px',
        borderRadius:  '8px',
        background:    'rgba(219,25,39,0.92)',
        color:         '#fff',
        display:       'flex',
        alignItems:    'center',
        justifyContent:'center',
        fontWeight:    '700',
        fontSize:      count > 1 ? '1.4rem' : '1.6rem',
        boxShadow:     '0 8px 24px rgba(0,0,0,0.5)',
        transform:     'rotate(3deg)',
        left:          (e.clientX - 26) + 'px',
        top:           (e.clientY - 34) + 'px',
        transition:    'none',
        fontFamily:    'inherit',
      });
      document.body.appendChild(el);
      this._drag.ghostEl = el;
    },

    _cleanupGhost() {
      if (this._drag?.ghostEl) {
        document.body.removeChild(this._drag.ghostEl);
        this._drag.ghostEl = null;
      }
      if (this._drag) { this._drag.active = false; this._drag.item = null; }
      this.touchDragOverAlbumId = null;
    },
  },
};
</script>

<template>
  <!-- ── Schermata accesso richiesto ── -->
  <section v-if="requiresLogin" class="login-wall">
    <div class="login-wall-inner">
      <i class="fa-solid fa-bookmark login-wall-icon"></i>
      <h2>I tuoi preferiti ti aspettano</h2>
      <p>Accedi al tuo account per salvare film e serie TV e ritrovarli sempre.</p>
      <div class="login-wall-actions">
        <button class="btn-wall btn-wall-primary" @click="openLogin('login')">
          <i class="fa-solid fa-right-to-bracket"></i> Accedi
        </button>
        <button class="btn-wall btn-wall-secondary" @click="openLogin('signup')">
          <i class="fa-solid fa-user-plus"></i> Registrati
        </button>
      </div>
    </div>
    <AuthModal v-if="showAuth" :initial-mode="authInitialMode" @close="showAuth = false" />
  </section>

  <!-- ── Contenuto principale ── -->
  <section v-else class="container-list">

    <!-- Loader per caricamenti di pagina (album, preferiti, provider) -->
    <PageLoader :visible="albums.loading || favorites.loading || loadingProviders || loadingGenres" />

    <div class="page-header">
      <h2>Preferiti</h2>
    </div>

    <!-- ─────────── SEZIONE ALBUM ─────────── -->
    <div v-if="showAlbums" class="albums-section">
      <h3 class="section-label">
        <i class="fa-solid fa-folder"></i> Cartelle
      </h3>

      <div v-if="!albums.loading" class="albums-grid">

        <!-- Card "Nuova Cartella" -->
        <button class="album-card-new" @click="openCreateAlbum" aria-label="Crea nuova cartella">
          <div class="album-card-new__icon">
            <i class="fa-solid fa-folder-plus"></i>
          </div>
          <span class="album-card-new__label">Nuova cartella</span>
        </button>

        <!-- Album esistenti -->
        <div
          v-for="album in albums.albums"
          :key="album.id"
          class="album-touch-target"
          :data-album-id="album.id"
        >
          <AlbumCard
            :album="album"
            @open="openAlbumId = $event"
            @drop-items="onDropItems"
            @delete="albums.deleteAlbum($event)"
            @rename="onAlbumRename"
          />
          <!-- Overlay highlight per touch drag -->
          <div v-if="touchDragOverAlbumId === album.id" class="album-touch-over" />
        </div>

      </div>
    </div>

    <hr v-if="showAlbums && favorites.items.length > 0" class="section-divider" />

    <!-- ─────────── CONTROLLI ─────────── -->
    <div v-if="favorites.items.length > 0" class="controls-row">
      <div class="filter-chips" role="group" aria-label="Filtra per tipo">
        <button
          v-for="chip in filterChips"
          :key="chip.value"
          class="filter-chip"
          :class="{ active: typeFilter === chip.value }"
          :disabled="chip.count === 0 && chip.value !== 'all'"
          :aria-pressed="typeFilter === chip.value"
          @click="setTypeFilter(chip.value)"
        >
          {{ chip.label }}
          <span class="chip-count">{{ chip.count }}</span>
        </button>
      </div>

      <div class="controls-right">
        <SearchFilters
          :genres-list="genresList"
          :genres="selectedGenres"
          :sort-by="sortBy"
          :sort-order="sortOrder"
          :custom-sort-options="sortOptionsForMyList"
          :providers-list="providersListForMyList"
          :providers="providerFilter"
          :show-genres="true"
          :show-sort="true"
          @update:genres="onGenresChange"
          @update:sort-by="onSortByChange"
          @update:sort-order="onSortOrderChange"
          @update:providers="onProvidersChange"
        />
        <button
          class="btn-select"
          :class="{ 'btn-select--active': selectMode }"
          @click="toggleSelectMode"
        >
          <i class="fa-solid" :class="selectMode ? 'fa-xmark' : 'fa-square-check'"></i>
          {{ selectMode ? 'Annulla' : 'Seleziona' }}
        </button>
      </div>
    </div>

    <!-- ─────────── GRIGLIA CARD ─────────── -->
    <LoadingSkeleton v-if="favorites.loading" :count="12" />
    <EmptyState
      v-else-if="favorites.items.length === 0"
      message="Nessun titolo nei preferiti"
    />
    <p v-else-if="filteredItems.length === 0 && !loadingProviders" class="filter-empty">
      Nessun preferito con questi filtri.
    </p>
    <div v-else class="card-grid">
      <div
        v-for="item in filteredItems"
        :key="item.media_type + '-' + item.tmdb_id"
        @pointerdown="onCardPointerStart($event, item)"
      >
        <MovieCard
          :item="item"
          :media-type="item.media_type"
          :selectable="selectMode"
          :selected="isSelected(item)"
          @toggle-select="onToggleSelect"
        />
      </div>
      <div v-for="n in 6" :key="'fill-' + n" class="card-fill" aria-hidden="true"></div>
    </div>

    <!-- ─────────── FLOATING ACTION BAR ─────────── -->
    <Teleport to="body">
      <Transition name="fab">
        <div v-if="selectMode && selectedItems.length > 0" class="fab-bar">
          <span class="fab-count">
            {{ selectedItems.length }} selezionat{{ selectedItems.length === 1 ? 'o' : 'i' }}
          </span>

          <div class="fab-move-wrapper" ref="moveDropdown">
            <button
              class="fab-btn fab-btn-primary"
              @click.stop="showMoveDropdown = !showMoveDropdown"
            >
              <i class="fa-solid fa-folder-arrow-up"></i>
              Sposta
              <i class="fa-solid fa-chevron-up" style="font-size:0.65rem"></i>
            </button>

            <div v-if="showMoveDropdown" class="fab-dropdown">
              <button
                v-for="album in albums.albums"
                :key="album.id"
                class="fab-dropdown-item"
                @click="moveToAlbum(album.id)"
              >
                <i class="fa-solid fa-folder"></i>
                <span class="fab-dropdown-text">{{ album.name }}</span>
              </button>
              <div v-if="albums.albums.length > 0" class="fab-dropdown-divider"></div>
              <button class="fab-dropdown-item fab-dropdown-new" @click="openCreateAlbumAndMove">
                + Nuova cartella
              </button>
            </div>
          </div>

          <button class="fab-btn fab-btn-ghost" @click="deselectAll">
            <i class="fa-solid fa-circle-xmark"></i> Deseleziona
          </button>
        </div>
      </Transition>
    </Teleport>

    <!-- ─────────── MODALI ─────────── -->
    <CreateAlbumModal
      v-if="showCreateAlbum"
      @create="onAlbumCreated"
      @close="showCreateAlbum = false"
    />
    <AlbumDetailModal
      v-if="openAlbumId != null"
      :album-id="openAlbumId"
      @close="openAlbumId = null"
    />
    <AuthModal
      v-if="showAuth"
      :initial-mode="authInitialMode"
      @close="showAuth = false"
    />

  </section>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;

.container-list {
  padding: 12vh 40px 100px;
}

.page-header {
  margin-bottom: $space-lg;
  h2 { font-weight: 700; margin: 0; }
}

// ── Sezione album ─────────────────────────────────────────────────────────
.albums-section {
  margin-bottom: $space-lg;
}

.section-label {
  display: flex;
  align-items: center;
  gap: $space-sm;
  font-size: 0.92rem;
  font-weight: 600;
  color: $color-text-muted;
  margin: 0 0 $space-md;
  i { color: $color-accent; }
}

.albums-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));

  @media (min-width: 480px)  { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
  @media (min-width: 768px)  { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
}

// ── Card "Nuova Cartella" ─────────────────────────────────────────────────
.album-card-new {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  aspect-ratio: 1 / 1.1;
  padding: $space-md $space-sm;
  background: rgba(255, 255, 255, 0.02);
  border: 1.5px dashed rgba(255, 255, 255, 0.13);
  border-radius: $radius-md;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  text-align: center;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.32);

    .album-card-new__icon { color: $color-accent; }
    .album-card-new__label { color: $color-text-muted; }
  }

  &__icon {
    font-size: 2rem;
    color: rgba(255, 255, 255, 0.22);
    transition: color 0.15s;
    line-height: 1;
  }

  &__label {
    font-size: 0.68rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.28);
    transition: color 0.15s;
    line-height: 1.3;
  }
}

// ── Touch drag targets ────────────────────────────────────────────────────
.album-touch-target {
  position: relative;
}

.album-touch-over {
  position: absolute;
  inset: 0;
  z-index: 5;
  border-radius: $radius-md;
  border: 2.5px solid $color-accent;
  background: rgba(219, 25, 39, 0.12);
  pointer-events: none;
  transform: scale(1.04);
  transition: opacity 0.1s;
}

// ── Divisore ──────────────────────────────────────────────────────────────
.section-divider {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin: $space-lg 0;
}

// ── Controlli ─────────────────────────────────────────────────────────────
.controls-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: $space-sm;
  margin-bottom: $space-lg;
  justify-content: space-between;
}

.filter-chips {
  display: flex;
  gap: $space-sm;
  flex-wrap: wrap;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  background: transparent;
  color: $color-text-muted;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 5px 14px;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;

  &:hover:not(:disabled) { border-color: rgba(255,255,255,0.55); color: $color-text; }
  &.active {
    background-color: $color-text; border-color: $color-text; color: #000; font-weight: 700;
    .chip-count { color: rgba(0,0,0,0.5); }
    &:hover { color: #000; border-color: $color-text; }
  }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
}

.chip-count { font-size: 0.75rem; color: $color-text-dim; font-weight: 400; }

.controls-right {
  display: flex;
  align-items: center;
  gap: $space-sm;
  flex-wrap: wrap;
}

.btn-select {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  background: transparent;
  color: $color-text-muted;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 5px 14px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background-color 0.15s;

  &:hover { border-color: rgba(255,255,255,0.55); color: $color-text; }
  &--active {
    border-color: $color-accent; color: #ff6b78;
    &:hover { background-color: rgba(219,25,39,0.08); }
  }
}

// ── Griglia card ──────────────────────────────────────────────────────────
.card-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, 1fr);

  @media (min-width: 480px)  { grid-template-columns: repeat(4, 1fr); }
  @media (min-width: 768px)  { grid-template-columns: repeat(5, 1fr); }
  @media (min-width: 992px)  { grid-template-columns: repeat(6, 1fr); }
  @media (min-width: 1280px) { grid-template-columns: repeat(7, 1fr); }
}

.card-fill { visibility: hidden; pointer-events: none; }
.filter-empty { text-align: center; font-style: italic; color: $color-text-dim; padding: 40px 0; }

// ── Floating Action Bar ──────────────────────────────────────────────────
.fab-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 500;
  display: flex;
  align-items: center;
  gap: $space-sm;
  background-color: rgba(28, 28, 28, 0.97);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 100px;
  padding: 10px 18px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
  white-space: nowrap;

  @media (max-width: $bp-lg) { bottom: 80px; }
  @media (max-width: 480px) {
    left: $space-md; right: $space-md; transform: none;
    border-radius: $radius-md; flex-wrap: wrap; justify-content: center;
  }
}

.fab-count {
  font-size: 0.85rem; font-weight: 600; color: $color-text-muted;
  padding-right: $space-sm; border-right: 1px solid rgba(255,255,255,0.12);
}

.fab-move-wrapper { position: relative; }

.fab-btn {
  display: inline-flex; align-items: center; gap: 6px;
  border: none; border-radius: 100px;
  padding: 7px 16px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
  transition: opacity 0.15s, background-color 0.15s;

  &-primary { background: $color-accent; color: $color-text; &:hover { opacity: 0.85; } }
  &-ghost   { background: rgba(255,255,255,0.08); color: $color-text-muted;
               &:hover { background-color: rgba(255,255,255,0.14); color: $color-text; } }
}

.fab-dropdown {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 0;
  z-index: 600;
  // Larghezza: almeno 160px, al massimo la larghezza dell'intera fab-bar
  min-width: 160px;
  max-width: min(220px, calc(100vw - 48px));

  background-color: rgba(20,20,20,0.98);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: $radius-md;
  box-shadow: 0 8px 32px rgba(0,0,0,0.7);
  overflow: hidden;
}

.fab-dropdown-item {
  display: flex; align-items: center; gap: $space-sm;
  width: 100%; padding: 10px 14px; background: none; border: none;
  color: $color-text-muted; font-size: 0.85rem; text-align: left; cursor: pointer;
  transition: background-color 0.12s, color 0.12s;
  min-width: 0; // necessario per il truncation dei figli flex

  i { color: $color-accent; flex-shrink: 0; }
  &:hover { background-color: rgba(255,255,255,0.07); color: $color-text; }
}

// Testo dell'album nel dropdown — troncato se troppo lungo
.fab-dropdown-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fab-dropdown-divider { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 2px 0; }
.fab-dropdown-new     { color: $color-text; font-weight: 600; }

// Su mobile il dropdown non ha un wrapper posizionato:
// usa direttamente .fab-bar (position:fixed) come containing block
// → left:0 / right:0 lo allineano perfettamente alla bar, niente sforamenti
@media (max-width: 480px) {
  .fab-move-wrapper {
    position: static;
  }
  .fab-dropdown {
    left: 0;
    right: 0;
    min-width: 0;
    max-width: none;
  }
}

.fab-enter-active, .fab-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fab-enter-from, .fab-leave-to       { opacity: 0; transform: translateX(-50%) translateY(12px); }
@media (max-width: 480px) {
  .fab-enter-from, .fab-leave-to { transform: translateY(12px); }
}

@media (max-width: 768px) {
  .container-list { padding: 12vh 16px 100px; }
  .page-header    { margin-bottom: $space-md; }
  .controls-row   { gap: 10px; }
}

// ── Schermata login richiesto ─────────────────────────────────────────────
.login-wall {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  padding: $space-xl $space-md;
}
.login-wall-inner { text-align: center; max-width: 420px; }
.login-wall-icon  { font-size: 3.5rem; color: $color-accent; margin-bottom: $space-lg; display: block; }
.login-wall-inner h2 { font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 700; margin-bottom: $space-sm; }
.login-wall-inner p  { color: $color-text-muted; margin-bottom: $space-lg; line-height: 1.5; }
.login-wall-actions  { display: flex; gap: $space-md; justify-content: center; flex-wrap: wrap; }
.btn-wall {
  display: inline-flex; align-items: center; gap: $space-sm;
  border: none; border-radius: $radius-sm; padding: 12px 28px;
  font-size: 1rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s;
  &:hover { opacity: 0.85; }
  &.btn-wall-primary   { background-color: $color-accent;            color: $color-text; }
  &.btn-wall-secondary { background-color: rgba(109,109,110,0.7);    color: $color-text; }
}
</style>
