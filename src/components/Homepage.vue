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
      showModal: false,
      store,
      movies: [],
      topRatedMovies: [],
      popularMovies: [],
      horrorMovies: [],
      romanticMovies: [],
      actionMovies: [],
      jumbo_data: {},
      breakpoints: {
        320: { slidesPerView: 2, spaceBetween: 5 },
        640: { slidesPerView: 3, spaceBetween: 10 },
        768: { slidesPerView: 4, spaceBetween: 15 },
        1024: { slidesPerView: 5, spaceBetween: 20 },
      },
      trailerUrl: '',
    };
  },
  created() {
    this.fetchMoviesData();
  },
  methods: {
    async fetchMoviesData() {
      await Promise.all([
        this.fetchMovies('now_playing', this.movies, 'jumbo_data'),
        this.fetchMovies('top_rated', this.topRatedMovies),
        this.fetchMovies('popular', this.popularMovies),
        this.fetchGenreMovies('27', this.horrorMovies),
        this.fetchGenreMovies('10749', this.romanticMovies),
        this.fetchGenreMovies('28', this.actionMovies),
      ]);
    },
    async fetchMovies(endpoint, targetArray, jumboDataKey = null) {
      try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${endpoint}`, {
          params: { api_key: store.apiKey, language: 'it-IT', region: 'IT' },
        });
        targetArray.splice(0, targetArray.length, ...response.data.results);
        if (jumboDataKey) {
          this.jumbo_data = targetArray[Math.floor(Math.random() * targetArray.length)];
        }
      } catch (error) {
        console.error(`Errore nel recupero dei film (${endpoint}):`, error);
      }
    },
    async fetchGenreMovies(genreId, targetArray) {
      try {
        const response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
          params: { api_key: store.apiKey, language: 'it-IT', region: 'IT', with_genres: genreId },
        });
        targetArray.splice(0, targetArray.length, ...response.data.results);
      } catch (error) {
        console.error(`Errore nel recupero dei film del genere ${genreId}:`, error);
      }
    },
    async fetchMovieVideos(movieId) {
      try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/videos`, {
          params: { api_key: store.apiKey }
        });
        return response.data.results;
      } catch (error) {
        console.error('Errore nel recupero dei video del film:', error);
        return [];
      }
    },
    async playJumboMovieTrailer() {
      const videos = await this.fetchMovieVideos(this.jumbo_data.id);
      const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');
      if (trailer) {
        this.trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
        this.showModal = true;
      } else {
        alert('Trailer non disponibile');
      }
    },
    async playMovieTrailer(movie) {
      const videos = await this.fetchMovieVideos(movie.id);
      const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');
      if (trailer) {
        this.trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
        this.showModal = true;
      } else {
        alert('Trailer non disponibile');
      }
    },
    toggleJumboMovieInList() {
      this.toggleMovieInList(this.jumbo_data);
    },
    toggleMovieInList(movie) {
      const index = this.store.myList.findIndex(item => item.id === movie.id);
      if (index !== -1) {
        this.store.myList.splice(index, 1);
      } else {
        this.store.myList.push(movie);
      }
    },
    isJumboMovieInList() {
      return this.store.myList.some(item => item.id === this.jumbo_data.id);
    },
    isMovieInList(movie) {
      return this.store.myList.some(item => item.id === movie.id);
    },
    getImageUrl(image) {
      return `https://image.tmdb.org/t/p/w1280${image}`;
    },
  },
};
</script>



<template>
  <div v-if="store.searchText == ''">
    <!-- Jumbotron -->
    <div class="jumbo">
      <img :src="getImageUrl(jumbo_data.backdrop_path)" alt="">
      <div class="jumbo-text">
        <h2>{{ jumbo_data.original_title }}</h2>
        <p>{{ jumbo_data.overview }}</p>
        <div class="d-flex align-items-center gap-3">
          <button class="btn btn-outline-light" @click="playJumboMovieTrailer">
            <i class="fa-solid fa-play"></i> Trailer
          </button>
          <div class="checkbox-wrapper-35">
            <input
              value="private"
              name="switch"
              id="jumbo-switch"
              type="checkbox"
              class="switch"
              @change="toggleJumboMovieInList"
              :checked="isJumboMovieInList()"
            />
            <label for="jumbo-switch">
              <span class="switch-x-toggletext">
                <span v-if="!isJumboMovieInList()" class="switch-x-unchecked">
                  <span class="switch-x-hiddenlabel"></span>Aggiungi alla lista
                </span>
                <span v-else class="switch-x-checked">
                  <span class="switch-x-hiddenlabel"></span>Rimuovi dalla lista
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="showModal">
      <div class="modal-content">
        <span class="close-button" @click="showModal = false">&times;</span>
        <iframe
          width="100%"
          height="100%"
          :src="trailerUrl"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </div>


    <!-- Sezioni di film -->
    <template v-for="(movieList, title) in {
      'Novità su Netflix': movies,
      'Film più votati': topRatedMovies,
      'Film più visti': popularMovies,
      'Film horror': horrorMovies,
      'Film romantici': romanticMovies,
      'Film d\'azione': actionMovies
    }">
      <div class="p-3">
        <h2>{{ title }}</h2>
        <swiper :slides-per-view="5" :space-between="10" :breakpoints="breakpoints">
          <swiper-slide v-for="movie in movieList" :key="movie.id">
            <div class="card">
              <div class="card-image">
                <img :src="getImageUrl(movie.poster_path)" alt="">
              </div>
              <div class="card-details">
                <h4>{{ movie.title }}</h4>
                <p>{{ movie.overview }}</p>
                <div class="d-flex align-items-center gap-3">
                  <button class="btn btn-outline-light trailer_button" @click="playMovieTrailer(movie)">
                    <i class="fa-solid fa-play"></i>
                  </button>
                  <div class="checkbox-wrapper-35">
                    <input
                      value="private"
                      name="switch"
                      :id="'switch-' + movie.id"
                      type="checkbox"
                      class="switch"
                      @change="toggleMovieInList(movie)"
                      :checked="isMovieInList(movie)"
                    />
                    <label :for="'switch-' + movie.id">
                      <span class="switch-x-toggletext">
                        <span v-if="!isMovieInList(movie)" class="switch-x-unchecked">
                          <span class="switch-x-hiddenlabel"></span>Aggiungi alla lista
                        </span>
                        <span v-else class="switch-x-checked">
                          <span class="switch-x-hiddenlabel"></span>Rimuovi dalla lista
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </swiper-slide>
        </swiper>
      </div>
    </template>

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
    
    h2 {
      font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
    }

    p {
      height: 100px;
      width: 40%;
      overflow: auto
    }
  }
}

</style>

