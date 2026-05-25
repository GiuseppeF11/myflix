<script>
import { Swiper, SwiperSlide } from 'vue-awesome-swiper';
import 'swiper/swiper-bundle.css';
import { getNowPlaying, getTopRated, getPopularMovies, getDiscoverByGenre, getTrailerUrl } from '../services/tmdb.js';
import { getImageUrl as buildImageUrl } from '../utils/images.js';
import { GENRES } from '../constants/genres.js';
import { useSearchStore } from '../stores/search.js';
import { useFavoritesStore } from '../stores/favorites.js';
import MovieCard from './MovieCard.vue';
import TrailerModal from './TrailerModal.vue';

export default {
  components: {
    Swiper,
    SwiperSlide,
    MovieCard,
    TrailerModal,
  },
  setup() {
    const search = useSearchStore();
    const favorites = useFavoritesStore();
    return { search, favorites };
  },
  data() {
    return {
      showModal: false,
      movies: [],
      topRatedMovies: [],
      popularMovies: [],
      horrorMovies: [],
      romanticMovies: [],
      actionMovies: [],
      sciFiMovies: [],
      comedyMovies: [],
      documentaryMovies: [],
      jumbo_data: {},
      breakpoints: {
        320:  { slidesPerView: 3,   spaceBetween: 6  },
        480:  { slidesPerView: 4,   spaceBetween: 8  },
        768:  { slidesPerView: 5,   spaceBetween: 10 },
        992:  { slidesPerView: 6,   spaceBetween: 10 },
        1280: { slidesPerView: 7,   spaceBetween: 10 },
      },
      trailerUrl: '',
      trailerError: false,
    };
  },
  created() {
    this.fetchMoviesData();
  },
  methods: {
    async fetchMoviesData() {
      try {
        const [nowPlaying, topRated, popular, horror, romance, action, sciFi, comedy, documentary] =
          await Promise.all([
            getNowPlaying(),
            getTopRated(),
            getPopularMovies(),
            getDiscoverByGenre(GENRES.horror),
            getDiscoverByGenre(GENRES.romance),
            getDiscoverByGenre(GENRES.action),
            getDiscoverByGenre(GENRES.sciFi),
            getDiscoverByGenre(GENRES.comedy),
            getDiscoverByGenre(GENRES.documentary),
          ]);
        this.movies = nowPlaying;
        this.topRatedMovies = topRated;
        this.popularMovies = popular.results;
        this.horrorMovies = horror;
        this.romanticMovies = romance;
        this.actionMovies = action;
        this.sciFiMovies = sciFi;
        this.comedyMovies = comedy;
        this.documentaryMovies = documentary;
        this.jumbo_data = this.movies[Math.floor(Math.random() * this.movies.length)] || {};
      } catch (error) {
        console.error('Errore nel recupero dei film:', error);
      }
    },
    playJumboMovieTrailer() {
      this.playMovieTrailer(this.jumbo_data);
    },
    async playMovieTrailer(movie) {
      const url = await getTrailerUrl(movie.id, 'movie');
      if (url) {
        this.trailerUrl = url;
        this.showModal = true;
      } else {
        this.showTrailerError();
      }
    },
    showTrailerError() {
      this.trailerError = true;
      setTimeout(() => {
        this.trailerError = false;
      }, 2000);
    },
    toggleJumboMovieInList() {
      this.favorites.toggle(this.jumbo_data, 'movie');
    },
    isJumboMovieInList() {
      return this.favorites.isFavorite(this.jumbo_data.id, 'movie');
    },
    getImageUrl(path, size = 'w342') {
      return buildImageUrl(path, size);
    },
  },
};
</script>

<template>
  <div v-if="!search.text.trim()">
    <!-- Hero / Billboard -->
    <section class="hero" v-if="jumbo_data.id">
      <div class="hero-bg">
        <img :src="getImageUrl(jumbo_data.backdrop_path, 'w1280')" :alt="jumbo_data.title || jumbo_data.original_title || ''">
      </div>
      <div class="hero-content">
        <h1 class="hero-title">{{ jumbo_data.title || jumbo_data.original_title }}</h1>
        <p class="hero-overview">{{ jumbo_data.overview }}</p>
        <div class="hero-actions">
          <button class="btn-hero btn-play" @click="playJumboMovieTrailer">
            <i class="fa-solid fa-play"></i> Riproduci
          </button>
          <button class="btn-hero btn-secondary" @click="toggleJumboMovieInList">
            <i :class="isJumboMovieInList() ? 'fa-solid fa-check' : 'fa-solid fa-plus'"></i>
            {{ isJumboMovieInList() ? 'Nella lista' : 'La mia lista' }}
          </button>
        </div>
      </div>
    </section>

    <TrailerModal :show="showModal" :url="trailerUrl" @close="showModal = false" />

    <div class="trailer-error" v-if="trailerError">
      <h2>Trailer non disponibile</h2>
    </div>

    <!-- Righe di film -->
    <template v-for="(movieList, title) in {
      'Novità su Myflix': movies,
      'Film più votati': topRatedMovies,
      'Film più visti': popularMovies,
      'Film horror': horrorMovies,
      'Film romantici': romanticMovies,
      'Film d\'azione': actionMovies,
      'Film di fantascienza': sciFiMovies,
      'Commedie': comedyMovies,
      'Documentari': documentaryMovies
    }">
      <div class="row-section">
        <h2 class="row-title">{{ title }}</h2>
        <swiper :slides-per-view="5" :space-between="10" :breakpoints="breakpoints">
          <swiper-slide v-for="movie in movieList" :key="movie.id">
            <MovieCard :item="movie" media-type="movie" />
          </swiper-slide>
        </swiper>
      </div>
    </template>

  </div>
</template>


<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;

.hero {
  position: relative;
  width: 100%;
  height: 80vh;
  min-height: 420px;
  margin-bottom: $space-lg;

  .hero-bg {
    position: absolute;
    inset: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
    }

    // Doppio gradiente Netflix: sfuma in basso e da sinistra.
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background:
        linear-gradient(to top, $color-bg 0%, rgba(28, 28, 28, 0.2) 50%, rgba(28, 28, 28, 0.1) 100%),
        linear-gradient(to right, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.3) 40%, rgba(0, 0, 0, 0) 70%);
    }
  }

  .hero-content {
    position: absolute;
    bottom: 12%;
    left: 0;
    width: 100%;
    max-width: 640px;
    padding: 0 $space-xl;
    z-index: 1;
  }

  .hero-title {
    font-size: clamp(1.8rem, 4vw, 3.2rem);
    font-weight: 800;
    margin-bottom: $space-md;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  }

  .hero-overview {
    font-size: clamp(0.9rem, 1.4vw, 1.1rem);
    line-height: 1.4;
    color: $color-text-muted;
    margin-bottom: $space-lg;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
  }
}

.hero-actions {
  display: flex;
  gap: $space-md;
  flex-wrap: wrap;
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

.row-section {
  padding: $space-md $space-xl;
}

.row-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: $space-md;
}

@media (max-width: $bp-md) {
  .hero {
    height: 70vh;

    .hero-content {
      padding: 0 $space-md;
      bottom: 8%;
    }
  }

  .row-section {
    padding: $space-md;
  }
}
</style>
