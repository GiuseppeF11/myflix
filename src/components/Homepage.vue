<script>
import axios from 'axios';
import { Swiper, SwiperSlide } from 'vue-awesome-swiper';
import 'swiper/swiper-bundle.css'; // Assicurati di importare il CSS di Swiper
import { store } from '../store.js';

export default {
  components: {
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      store,
      movies: [], // Array per memorizzare i film più recenti
      topRatedMovies: [], // Array per memorizzare i film più votati
      popularMovies: [],
      backdrop_image: '',
      breakpoints: {
        // Configurazione dei breakpoints per Swiper
        320: {
          slidesPerView: 2,
          spaceBetween: 5,
        },
        640: {
          slidesPerView: 3,
          spaceBetween: 10,
        },
        768: {
          slidesPerView: 4,
          spaceBetween: 15,
        },
        1024: {
          slidesPerView: 5,
          spaceBetween: 20,
        },
      },
    };
  },
  created() {
    this.fetchRecentMovies();
    this.fetchTopRatedMovies();
    this.fetchPopularMovies();
  },
  methods: {
    async fetchRecentMovies() {
      try {
        const response = await axios.get(
          'https://api.themoviedb.org/3/movie/now_playing',
          {
            params: {
              api_key: store.apiKey, // Inserisci la tua chiave API qui
              language: 'it-IT',
              region: 'IT',
            },
          }
        );
        this.movies = response.data.results; // Salva i film nell'array movies
        if (this.movies.length > 0) {
          this.backdrop_image = this.getImageUrl(this.movies[0].backdrop_path);
        }
      } catch (error) {
        console.error('Errore nel recupero dei film:', error);
      }
    },
    async fetchPopularMovies() {
      try {
        const response = await axios.get(
          'https://api.themoviedb.org/3/movie/popular',
          {
            params: {
              api_key: store.apiKey, // Inserisci la tua chiave API qui
              language: 'it-IT',
              region: 'IT',
            },
          }
        );
        this.popularMovies = response.data.results; // Salva i film nell'array movies
        if (this.movies.length > 0) {
          this.backdrop_image = this.getImageUrl(this.movies[0].backdrop_path);
        }
      } catch (error) {
        console.error('Errore nel recupero dei film:', error);
      }
    },
    async fetchTopRatedMovies() {
      try {
        const response = await axios.get(
          'https://api.themoviedb.org/3/movie/top_rated',
          {
            params: {
              api_key: store.apiKey, // Inserisci la tua chiave API qui
              language: 'it-IT',
              region: 'IT',
            },
          }
        );
        this.topRatedMovies = response.data.results; // Salva i film nell'array topRatedMovies
      } catch (error) {
        console.error('Errore nel recupero dei film più votati:', error);
      }
    },
    getImageUrl(image) {
      return `https://image.tmdb.org/t/p/w500${image}`;
    },
  },
};
</script>

<template>
  <div v-if="store.searchText == ''">
    <div class="jumbo">
      <img :src="this.backdrop_image" alt="">
      <div class="jumbo-text">
        <!-- <h2> {{this.movies[0].original_title }}</h2> -->
      </div>
    </div>
    <div class="p-3">
      <h3>Novità su Netflix</h3>
      <swiper :slides-per-view="5" :space-between="10" :breakpoints="breakpoints">
        <swiper-slide v-for="movie in movies" :key="movie.id">
          <section class="card">
            <div class="card-image">
              <img :src="getImageUrl(movie.poster_path)" alt="">
            </div>
            <div class="card-details">
              <!-- Dettagli della carta -->
            </div>
          </section>
        </swiper-slide>
      </swiper>
    </div>
    <div class="p-3">
      <h3>Film più votati</h3>
      <swiper :slides-per-view="5" :space-between="10" :breakpoints="breakpoints">
        <swiper-slide v-for="movie in topRatedMovies" :key="movie.id">
          <section class="card">
            <div class="card-image">
              <img :src="getImageUrl(movie.poster_path)" alt="">
            </div>
            <div class="card-details">
              <!-- Dettagli della carta -->
            </div>
          </section>
        </swiper-slide>
      </swiper>
    </div>
    <div class="p-3">
      <h3>Più Visti</h3>
      <swiper :slides-per-view="5" :space-between="10" :breakpoints="breakpoints">
        <swiper-slide v-for="movie in popularMovies" :key="movie.id">
          <section class="card">
            <div class="card-image">
              <img :src="getImageUrl(movie.poster_path)" alt="">
            </div>
            <div class="card-details">
              <!-- Dettagli della carta -->
            </div>
          </section>
        </swiper-slide>
      </swiper>
    </div>
  </div>
</template>



<style lang="scss" scoped>
.jumbo {
  width: 100%;
  height: 50vh;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: relative;
    mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgb(209, 255, 5) 50%, rgba(177, 0, 0, 0) 100%);
  }

  .jumbo-text {
    position: absolute;
    top: 40%;
    left: 30px;
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  }
}

.card {
  border-radius: 0;
  scale: 0.9;
  transition: transform linear 0.3s;
  &:hover {
    transform: scale(1.1);
  }
  .card-image {
    height: 350px;
    transition: linear 0.1s;
    cursor: pointer;
    &:hover {
      filter: brightness(20%);
      
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .card-details {
    /* Aggiungi stile per i dettagli della carta */
  }
}
</style>
