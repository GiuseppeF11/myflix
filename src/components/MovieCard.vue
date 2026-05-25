<script>
import { getImageUrl } from '../utils/images.js';
import { getTrailerUrl, getDetails } from '../services/tmdb.js';
import { useFavoritesStore } from '../stores/favorites.js';
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
  },
  setup() {
    const favorites = useFavoritesStore();
    return { favorites };
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
  },
  methods: {
    getImageUrl,
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
  <div class="movie-card">
    <div
      class="poster-wrap"
      role="button"
      tabindex="0"
      :aria-label="'Dettagli di ' + title"
      @click="openDetail"
      @keydown.enter="openDetail"
      @keydown.space.prevent="openDetail"
    >
      <img class="poster" :src="getImageUrl(item.poster_path, 'w500')" :alt="title" loading="lazy" />

      <!-- Badge tipo visibile nei risultati di ricerca -->
      <span v-if="showTypeBadge" class="type-badge" :class="mediaType === 'movie' ? 'badge-movie' : 'badge-tv'">
        <i :class="mediaType === 'movie' ? 'fa-solid fa-film' : 'fa-solid fa-tv'"></i>
        {{ mediaType === 'movie' ? 'Film' : 'Serie' }}
      </span>

      <div class="overlay">
        <div class="overlay-actions">
          <button class="circle-btn play" @click.stop="play" :aria-label="'Guarda il trailer di ' + title">
            <i class="fa-solid fa-play"></i>
          </button>
          <button
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
      </div>
    </div>

    <Teleport to="body">
      <DetailModal
        :show="showDetail"
        :loading="loadingDetail"
        :details="details"
        :is-fav="isFav"
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

  &:hover {
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
  font-size: 0.72rem;
  font-weight: 600;
  margin: 0;
  color: $color-text;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

// Desktop con hover: overlay nascosto, compare passando sopra; il poster zooma.
@media (hover: hover) {
  .overlay {
    opacity: 0;
  }
  .movie-card:hover {
    .overlay {
      opacity: 1;
    }
    .poster {
      transform: scale(1.06);
    }
  }
}

// Touch / mobile: overlay sempre visibile, gradiente più profondo, solo titolo.
@media (hover: none) {
  .overlay {
    opacity: 1;
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
