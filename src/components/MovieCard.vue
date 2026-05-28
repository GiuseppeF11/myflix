<script>
import { getImageUrl } from '../utils/images.js';
import { getTrailerUrl, getDetails } from '../services/tmdb.js';
import { useFavoritesStore } from '../stores/favorites.js';
import { useAuthStore } from '../stores/auth.js';
import TrailerModal from './TrailerModal.vue';
import DetailModal from './DetailModal.vue';

export default {
  name: 'MovieCard',
  components: { TrailerModal, DetailModal },
  props: {
    // Accetta sia oggetti grezzi TMDB (movie/tv) sia preferiti normalizzati.
    item: { type: Object, required: true },
    mediaType: { type: String, required: true }, // 'movie' | 'tv'
    // Mostra un badge colorato con il tipo (usato nei risultati di ricerca)
    showTypeBadge: { type: Boolean, default: false },
    // Modalità selezione (es. in MyList): click → toggle, draggable abilitato
    selectable: { type: Boolean, default: false },
    selected:   { type: Boolean, default: false },
  },
  emits: ['toggle-select'],
  setup() {
    const favorites = useFavoritesStore();
    const auth = useAuthStore();
    return { favorites, auth };
  },
  data() {
    return {
      showModal: false,
      trailerUrl: '',
      trailerError: false,
      showDetail: false,
      details: null,
      loadingDetail: false,
    };
  },
  computed: {
    id() {
      return this.item.id ?? this.item.tmdb_id;
    },
    title() {
      return this.item.title || this.item.name || '';
    },
    isFav() {
      return this.favorites.isFavorite(this.id, this.mediaType);
    },
    releaseYear() {
      const date = this.item.release_date || this.item.first_air_date;
      return date ? new Date(date).getFullYear() : null;
    },
    rating() {
      const v = this.item.vote_average;
      return v != null && v > 0 ? Number(v).toFixed(1) : null;
    },
  },
  methods: {
    getImageUrl,
    onCardClick() {
      if (this.selectable) {
        this.$emit('toggle-select', { tmdb_id: this.id, media_type: this.mediaType });
      } else {
        this.openDetail();
      }
    },
    toggle() {
      this.favorites.toggle(
        { id: this.id, title: this.title, poster_path: this.item.poster_path, overview: this.item.overview },
        this.mediaType
      );
    },
    async openDetail() {
      this.showDetail = true;
      this.loadingDetail = true;
      try {
        this.details = await getDetails(this.id, this.mediaType);
      } catch (error) {
        console.error('Errore nel recupero dei dettagli:', error);
      } finally {
        this.loadingDetail = false;
      }
    },
    async play() {
      this.showDetail = false;
      const url = await getTrailerUrl(this.id, this.mediaType);
      if (url) {
        this.trailerUrl = url;
        this.showModal = true;
      } else {
        this.trailerError = true;
        setTimeout(() => {
          this.trailerError = false;
        }, 2000);
      }
    },
  },
};
</script>

<template>
  <div class="movie-card" :class="{ 'movie-card--selectable': selectable, 'movie-card--selected': selectable && selected }">
    <div
      class="poster-wrap"
      role="button"
      tabindex="0"
      :aria-label="selectable ? (selected ? 'Deseleziona ' : 'Seleziona ') + title : 'Dettagli di ' + title"
      @click="onCardClick"
      @keydown.enter="onCardClick"
      @keydown.space.prevent="onCardClick"
    >
      <img class="poster" :src="getImageUrl(item.poster_path, 'w500')" :alt="title" loading="lazy" />

      <!-- Badge tipo visibile nei risultati di ricerca -->
      <span v-if="showTypeBadge" class="type-badge" :class="mediaType === 'movie' ? 'badge-movie' : 'badge-tv'">
        <i :class="mediaType === 'movie' ? 'fa-solid fa-film' : 'fa-solid fa-tv'"></i>
        {{ mediaType === 'movie' ? 'Film' : 'Serie' }}
      </span>

      <!-- Indicatore selezione -->
      <div v-if="selectable" class="select-overlay">
        <i :class="selected ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'"></i>
      </div>

      <div class="overlay">
        <div v-if="!selectable" class="overlay-actions">
          <button class="circle-btn play" @click.stop="play" :aria-label="'Guarda il trailer di ' + title">
            <i class="fa-solid fa-play"></i>
          </button>
          <button
            v-if="auth.isLoggedIn"
            class="circle-btn"
            :class="{ active: isFav }"
            @click.stop="toggle"
            :aria-pressed="isFav"
            :aria-label="(isFav ? 'Rimuovi dalla lista: ' : 'Aggiungi alla lista: ') + title"
          >
            <i :class="isFav ? 'fa-solid fa-check' : 'fa-solid fa-plus'"></i>
          </button>
        </div>
        <h4 class="overlay-title">{{ title }}</h4>
        <div v-if="releaseYear || rating" class="overlay-meta">
          <span v-if="rating" class="meta-rating">
            <i class="fa-solid fa-star"></i>{{ rating }}
          </span>
          <span v-if="releaseYear" class="meta-year">{{ releaseYear }}</span>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <DetailModal
        :show="showDetail"
        :loading="loadingDetail"
        :details="details"
        :is-fav="isFav"
        :media-type="mediaType"
        @close="showDetail = false"
        @play="play"
        @toggle="toggle"
      />
      <TrailerModal :show="showModal" :url="trailerUrl" @close="showModal = false" />
      <div class="trailer-error" v-if="trailerError">
        <h2>Trailer non disponibile</h2>
      </div>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;

.movie-card {
  border-radius: $radius-sm;
  overflow: hidden;
  background-color: $color-surface;
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  // Hover effects solo in modalità normale (non selezionabile)
  &:not(.movie-card--selectable):hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  }
}

.poster-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid $color-text;
    outline-offset: -2px;
  }

  .poster {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.35s ease;
  }
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 5px;
  padding: 8px 6px 6px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.45) 45%, rgba(0, 0, 0, 0) 75%);
  transition: opacity 0.25s ease;
}

.overlay-actions {
  display: flex;
  gap: 5px;
}

.overlay-title {
  font-size: 0.90rem;
  font-weight: 600;
  margin: 0;
  color: $color-text;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.overlay-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1;
}

.meta-rating {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.80rem;
  font-weight: 700;
  color: #f5c518;

  i { font-size: 0.55rem; }
}

.meta-year {
  font-size: 0.80rem;
  color: rgba(255, 255, 255, 0.55);
}

.circle-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.7);
  background-color: rgba(42, 42, 42, 0.6);
  color: $color-text;
  font-size: 0.68rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;

  &:hover {
    transform: scale(1.12);
    border-color: $color-text;
  }

  &.play:hover {
    background-color: $color-text;
    color: #000;
  }

  &.active {
    background-color: $color-accent;
    border-color: $color-accent;
  }
}

// Desktop: overlay sempre visibile (titolo), bottoni appaiono solo all'hover.
// (pointer: fine) esclude i dispositivi touch che Chrome Android segnala erroneamente come hover:hover
@media (hover: hover) and (pointer: fine) {
  .overlay-actions {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  // Hover effects SOLO in modalità normale
  .movie-card:not(.movie-card--selectable):hover {
    .overlay-actions { opacity: 1; }
    .poster          { transform: scale(1.06); }
  }

  // Hover in modalità selezionabile: outline sottile + cursore
  .movie-card--selectable {
    cursor: grab;
    &:active { cursor: grabbing; }

    &:not(.movie-card--selected):hover .poster-wrap {
      outline: 2px solid rgba(255, 255, 255, 0.3);
      outline-offset: -2px;
    }
  }
}

// Touch / mobile: overlay sempre visibile, gradiente più profondo, solo titolo.
// (pointer: coarse) cattura i touch screen che Chrome Android segnala come hover:hover
@media (hover: none), (pointer: coarse) {
  .overlay {
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.95) 0%,
      rgba(0, 0, 0, 0.6)  35%,
      rgba(0, 0, 0, 0.1)  65%,
      rgba(0, 0, 0, 0)    100%
    );
  }

  .overlay-actions {
    display: none;
  }

  .overlay-title {
    font-size: 0.68rem;
  }

  .meta-rating,
  .meta-year {
    font-size: 0.6rem;
  }
}

// ── Modalità selezione ────────────────────────────────────────────────────
.movie-card--selected .poster-wrap {
  outline: 2.5px solid $color-accent;
  outline-offset: -2.5px;
}

.select-overlay {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 3;
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.55);
  pointer-events: none;
  transition: color 0.15s;
  line-height: 1;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.8));

  .movie-card--selected & { color: $color-accent; }
}

// ---- Badge tipo (Film / Serie TV) ----
.type-badge {
  position: absolute;
  top: 5px;
  left: 5px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.58rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 2px 6px;
  border-radius: 3px;
  pointer-events: none;

  i { font-size: 0.54rem; }

  &.badge-movie {
    background-color: rgba(219, 25, 39, 0.82);
    color: #fff;
  }

  &.badge-tv {
    background-color: rgba(100, 149, 237, 0.85);
    color: #fff;
  }
}
</style>
