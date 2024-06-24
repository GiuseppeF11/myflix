<script>
import axios from 'axios';
import { Swiper, SwiperSlide } from 'vue-awesome-swiper';
import 'swiper/swiper-bundle.css'; 
import { store } from '../store.js';

export default {
  components: {
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      store,
      movies: [], 
      topRatedMovies: [],
      popularMovies: [],
      horrorMovies: [],
      romanticMovies: [],
      actionMovies: [],
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
    this.fetchHorrorMovies();
    this.fetchRomanticMovies();
    this.fetchActionMovies();
  },
  methods: {
    async fetchRecentMovies() {
      try {
        const response = await axios.get(
          'https://api.themoviedb.org/3/movie/now_playing',
          {
            params: {
              api_key: store.apiKey,
              language: 'it-IT',
              region: 'IT',
            },
          }
        );
        this.movies = response.data.results;
        if (this.movies.length > 0) {
          this.backdrop_image = this.getImageUrl(this.movies[Math.floor(Math.random() * 10)].backdrop_path);
        }
      } catch (error) {
        console.error('Errore nel recupero dei film recenti:', error);
      }
    },
    async fetchPopularMovies() {
      try {
        const response = await axios.get(
          'https://api.themoviedb.org/3/movie/popular',
          {
            params: {
              api_key: store.apiKey,
              language: 'it-IT',
              region: 'IT',
            },
          }
        );
        this.popularMovies = response.data.results;
      } catch (error) {
        console.error('Errore nel recupero dei film più visti:', error);
      }
    },
    async fetchTopRatedMovies() {
      try {
        const response = await axios.get(
          'https://api.themoviedb.org/3/movie/top_rated',
          {
            params: {
              api_key: store.apiKey,
              language: 'it-IT',
              region: 'IT',
            },
          }
        );
        this.topRatedMovies = response.data.results;
      } catch (error) {
        console.error('Errore nel recupero dei film più votati:', error);
      }
    },
    async fetchHorrorMovies() {
      try {
        const response = await axios.get(
          'https://api.themoviedb.org/3/discover/movie',
          {
            params: {
              api_key: store.apiKey,
              language: 'it-IT',
              region: 'IT',
              with_genres: 27, // Codice del genere "Horror"
            },
          }
        );
        this.horrorMovies = response.data.results;
      } catch (error) {
        console.error('Errore nel recupero dei film horror:', error);
      }
    },
    async fetchRomanticMovies() {
      try {
        const response = await axios.get(
          'https://api.themoviedb.org/3/discover/movie',
          {
            params: {
              api_key: store.apiKey,
              language: 'it-IT',
              region: 'IT',
              with_genres: 10749, // Codice del genere "Romantico"
            },
          }
        );
        this.romanticMovies = response.data.results;
      } catch (error) {
        console.error('Errore nel recupero dei film romantici:', error);
      }
    },
    async fetchActionMovies() {
      try {
        const response = await axios.get(
          'https://api.themoviedb.org/3/discover/movie',
          {
            params: {
              api_key: store.apiKey,
              language: 'it-IT',
              region: 'IT',
              with_genres: 28, // Codice del genere "Azione"
            },
          }
        );
        this.actionMovies = response.data.results;
      } catch (error) {
        console.error('Errore nel recupero dei film d\'azione:', error);
      }
    },
    getImageUrl(image) {
      return `https://image.tmdb.org/t/p/w1280${image}`;
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

    <!-- Sezione Novità su Netflix -->
    <div class="p-3">
      <h3>Novità su Netflix</h3>
      <swiper :slides-per-view="5" :space-between="10" :breakpoints="breakpoints">
        <swiper-slide v-for="movie in movies" :key="movie.id">
          <section class="card">
            <div class="card-image">
              <img :src="getImageUrl(movie.poster_path)" alt="">
            </div>
            <div class="card-details">
              <h4>{{ movie.original_title }}</h4>
              <button class="btn btn-outline-light"> Riproduci </button>
            </div>
          </section>
        </swiper-slide>
      </swiper>
    </div>

    <!-- Sezione Film più votati -->
    <div class="p-3">
      <h3>Film più votati</h3>
      <swiper :slides-per-view="5" :space-between="10" :breakpoints="breakpoints">
        <swiper-slide v-for="movie in topRatedMovies" :key="movie.id">
          <section class="card">
            <div class="card-image">
              <img :src="getImageUrl(movie.poster_path)" alt="">
            </div>
            <div class="card-details">
              <h4>{{ movie.original_title }}</h4>
            </div>
          </section>
        </swiper-slide>
      </swiper>
    </div>

    <!-- Sezione Film più visti -->
    <div class="p-3">
      <h3>Film più visti</h3>
      <swiper :slides-per-view="5" :space-between="10" :breakpoints="breakpoints">
        <swiper-slide v-for="movie in popularMovies" :key="movie.id">
          <section class="card">
            <div class="card-image">
              <img :src="getImageUrl(movie.poster_path)" alt="">
            </div>
            <div class="card-details">
              <h4>{{ movie.original_title }}</h4>
            </div>
          </section>
        </swiper-slide>
      </swiper>
    </div>

    <!-- Sezione Film horror -->
    <div class="p-3">
      <h3>Film horror</h3>
      <swiper :slides-per-view="5" :space-between="10" :breakpoints="breakpoints">
        <swiper-slide v-for="movie in horrorMovies" :key="movie.id">
          <section class="card">
            <div class="card-image">
              <img :src="getImageUrl(movie.poster_path)" alt="">
            </div>
            <div class="card-details">
              <h4>{{ movie.original_title }}</h4>
            </div>
          </section>
        </swiper-slide>
      </swiper>
    </div>

    <!-- Sezione Film romantici -->
    <div class="p-3">
      <h3>Film romantici</h3>
      <swiper :slides-per-view="5" :space-between="10" :breakpoints="breakpoints">
        <swiper-slide v-for="movie in romanticMovies" :key="movie.id">
          <section class="card">
            <div class="card-image">
              <img :src="getImageUrl(movie.poster_path)" alt="">
            </div>
            <div class="card-details">
              <h4>{{ movie.original_title }}</h4>
            </div>
          </section>
        </swiper-slide>
      </swiper>
    </div>

    <!-- Sezione Film d'azione -->
    <div class="p-3">
      <h3>Film d'azione</h3>
      <swiper :slides-per-view="5" :space-between="10" :breakpoints="breakpoints">
        <swiper-slide v-for="movie in actionMovies" :key="movie.id">
          <section class="card">
            <div class="card-image">
              <img :src="getImageUrl(movie.poster_path)" alt="">
            </div>
            <div class="card-details">
              <h4>{{ movie.original_title }}</h4>
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
  height: 70vh;

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
  position: relative; 
  overflow: hidden;
  scale: 0.9;
  transition: transform linear 0.3s;
  &:hover {
    transform: scale(1.1);
    .card-image {
      filter: brightness(20%); 
    }
    .card-details {
      display: block;
    }
  }
  .card-image {
    height: 350px;
    transition: linear 0.1s;
    cursor: pointer;
    position: relative; 
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .card-details {
    position: absolute;
    display: none;
    transition: linear 0.3s;
    color: whitesmoke;
    padding: 10px;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7); 
    z-index: 10;

    h4 {
      margin-bottom: 20px
    }
    p {
      height: 200px;
      overflow: auto;
    }
  }
}
</style>

