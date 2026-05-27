<script>
import { getBackdropUrl } from '../utils/images.js';
import { getWatchProviders, getReleaseDates } from '../services/tmdb.js';
import { useAuthStore } from '../stores/auth.js';
import PageLoader from './PageLoader.vue';

export default {
  name: 'DetailModal',
  components: { PageLoader },
  setup() {
    const auth = useAuthStore();
    return { auth };
  },
  props: {
    show: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    details: { type: Object, default: null },
    isFav: { type: Boolean, default: false },
    mediaType: { type: String, default: 'movie' },
  },
  emits: ['close', 'play', 'toggle'],
  data() {
    return { providers: null, releaseDates: [] };
  },
  watch: {
    details(val) {
      this.providers = null;
      this.releaseDates = [];
      if (val?.id) {
        getWatchProviders(val.id, this.mediaType)
          .then((p) => { this.providers = p; })
          .catch(() => {});
        if (this.mediaType === 'movie') {
          getReleaseDates(val.id)
            .then((dates) => { this.releaseDates = dates; })
            .catch(() => {});
        }
      }
    },
  },
  computed: {
    title() {
      return this.details?.title || this.details?.name || '';
    },
    year() {
      const date = this.details?.release_date || this.details?.first_air_date || '';
      return date ? date.slice(0, 4) : '';
    },
    rating() {
      const v = this.details?.vote_average;
      return typeof v === 'number' && v > 0 ? v.toFixed(1) : null;
    },
    voteCount() {
      return this.details?.vote_count || 0;
    },
    runtime() {
      const r = this.details?.runtime;
      if (r) return `${r} min`;
      const seasons = this.details?.number_of_seasons;
      if (seasons) return `${seasons} stagion${seasons > 1 ? 'i' : 'e'}`;
      return '';
    },
    genres() {
      return (this.details?.genres || []).map((g) => g.name);
    },
    isInCinema() {
      if (!this.releaseDates.length) return false;
      const now = Date.now();
      const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
      return this.releaseDates.some((r) => {
        if (r.type !== 3) return false; // 3 = Theatrical
        const releaseTime = new Date(r.release_date).getTime();
        return releaseTime <= now && now - releaseTime <= ninetyDaysMs;
      });
    },
    backdrop() {
      return getBackdropUrl(this.details?.backdrop_path || this.details?.poster_path);
    },
  },
};
</script>

<template>
  <div class="detail-overlay" v-if="show" @click.self="$emit('close')">
    <div class="detail-card">
      <!-- Pulsante chiudi fisso, non scrolla con il contenuto -->
      <button class="detail-close" @click="$emit('close')" aria-label="Chiudi"><i class="fa-solid fa-xmark"></i></button>

      <!-- Area scorrevole interna -->
      <div class="detail-scroll">
        <PageLoader :visible="loading" />

        <template v-if="details && !loading">
          <div class="detail-hero">
            <img :src="backdrop" :alt="title" />
            <h2 class="detail-title">{{ title }}</h2>
          </div>

          <div class="detail-body">
            <div class="detail-meta">
              <span v-if="rating" class="rating">
                <i class="fa-solid fa-star"></i> {{ rating }} <span class="rating-max">/ 10</span>
              </span>
              <span v-if="voteCount" class="votes">({{ voteCount.toLocaleString('it-IT') }} voti)</span>
              <span v-if="year" class="dot">•</span>
              <span v-if="year">{{ year }}</span>
              <span v-if="runtime" class="dot">•</span>
              <span v-if="runtime">{{ runtime }}</span>
            </div>

            <!-- Cinema + piattaforme streaming disponibili in Italia -->
            <div v-if="isInCinema || providers?.flatrate?.length" class="detail-providers">
              <span class="providers-label">Disponibile su</span>
              <div class="providers-logos">
                <span v-if="isInCinema" class="cinema-badge">
                  <i class="fa-solid fa-film"></i> Al Cinema
                </span>
              </div>
              <div v-if="providers?.flatrate?.length" class="providers-logos">
                <a
                  v-for="p in providers.flatrate"
                  :key="p.provider_id"
                  :href="providers.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  :title="p.provider_name"
                  class="provider-link"
                >
                  <img
                    :src="`https://image.tmdb.org/t/p/w45${p.logo_path}`"
                    :alt="p.provider_name"
                    class="provider-logo"
                  />
                </a>
              </div>
            </div>

            <p v-if="genres.length" class="detail-genres">{{ genres.join(' · ') }}</p>

            <div class="detail-actions">
              <button class="btn-hero btn-play" @click="$emit('play')">
                <i class="fa-solid fa-play"></i> Riproduci
              </button>
              <button v-if="auth.user" class="btn-hero btn-secondary" @click="$emit('toggle')">
                <i :class="isFav ? 'fa-solid fa-check' : 'fa-solid fa-plus'"></i>
                {{ isFav ? 'Nella lista' : 'La mia lista' }}
              </button>
            </div>

            <p class="detail-overview">{{ details.overview || 'Descrizione non disponibile.' }}</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;

.detail-overlay {
  position: fixed;
  inset: 0;
  z-index: $z-modal + 200;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5vh 16px;
  overflow: hidden; // scrollbar resta DENTRO la modale
  background-color: rgba(0, 0, 0, 0.75);
}

.detail-card {
  position: relative;
  width: 100%;
  max-width: 880px;
  max-height: 88vh;     // altezza massima vincolata alla viewport
  display: flex;
  flex-direction: column;
  background-color: $color-surface;
  border-radius: $radius-md;
  overflow: hidden;     // nasconde il border-radius sul hero image
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7);
}

// Area scorrevole interna: il pulsante chiudi resta fisso fuori da qui
.detail-scroll {
  overflow-y: auto;
  flex: 1;
  min-height: 0; // necessario in flexbox per permettere lo scroll figlio

  // Scrollbar sottile stile Netflix
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
}

.detail-close {
  position: absolute;
  top: 12px;
  right: 16px;
  z-index: 2;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: rgba(0, 0, 0, 0.6);
  color: $color-text;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &:hover {
    background-color: #000;
  }
}

.detail-hero {
  position: relative;

  img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    display: block;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, $color-surface 0%, rgba(35, 35, 35, 0.2) 60%, rgba(35, 35, 35, 0) 100%);
  }

  .detail-title {
    position: absolute;
    bottom: 16px;
    left: 24px;
    right: 24px;
    z-index: 1;
    font-size: clamp(1.4rem, 3vw, 2.2rem);
    font-weight: 800;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
  }
}

.detail-body {
  padding: $space-md $space-lg $space-xl;
}

.detail-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  color: $color-text-muted;
  font-size: 0.95rem;
  margin-bottom: $space-sm;

  .rating {
    color: #f5c518;
    font-weight: 700;
  }

  .rating-max {
    color: $color-text-dim;
    font-weight: 400;
  }

  .votes {
    color: $color-text-dim;
  }

  .dot {
    color: $color-text-dim;
  }
}

.detail-providers {
  display: flex;
  align-items: center;
  gap: $space-sm;
  flex-wrap: wrap;
  margin-bottom: $space-sm;
}

.providers-label {
  font-size: 0.82rem;
  color: $color-text-dim;
  white-space: nowrap;
}

.cinema-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background-color: rgba(219, 25, 39, 0.15);
  border: 1px solid rgba(219, 25, 39, 0.4);
  color: #ff6b78;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  white-space: nowrap;

  i { font-size: 0.75rem; }
}

.providers-logos {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.provider-link {
  display: inline-block;
  border-radius: 6px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }
}

.provider-logo {
  width: 34px;
  height: 34px;
  border-radius: 6px;
  object-fit: cover;
  display: block;
}

.detail-genres {
  color: $color-text-dim;
  font-size: 0.9rem;
  margin-bottom: $space-md;
}

.detail-actions {
  display: flex;
  gap: $space-md;
  flex-wrap: wrap;
  margin-bottom: $space-md;
}

.detail-overview {
  line-height: 1.5;
  color: $color-text-muted;
}

.btn-hero {
  display: inline-flex;
  align-items: center;
  gap: $space-sm;
  border: none;
  border-radius: $radius-sm;
  padding: 10px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease, background-color 0.15s ease;

  &.btn-play {
    background-color: $color-text;
    color: #000;
    &:hover { opacity: 0.85; }
  }

  &.btn-secondary {
    background-color: rgba(109, 109, 110, 0.7);
    color: $color-text;
    &:hover { background-color: rgba(109, 109, 110, 0.5); }
  }
}
</style>
