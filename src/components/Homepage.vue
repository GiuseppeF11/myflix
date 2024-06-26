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
        const response = await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
          params: { api_key: store.apiKey, language: 'it-IT', region: 'IT' },
        });
        this.movies = response.data.results;
        if (this.movies.length > 0) {
          this.jumbo_data = this.movies[Math.floor(Math.random() * this.movies.length)];
        }
      } catch (error) {
        console.error('Errore nel recupero dei film recenti:', error);
      }
    },
    async fetchTopRatedMovies() {
      try {
        const response = await axios.get('https://api.themoviedb.org/3/movie/top_rated', {
          params: { api_key: store.apiKey, language: 'it-IT', region: 'IT' },
        });
        this.topRatedMovies = response.data.results;
      } catch (error) {
        console.error('Errore nel recupero dei film più votati:', error);
      }
    },
    async fetchPopularMovies() {
      try {
        const response = await axios.get('https://api.themoviedb.org/3/movie/popular', {
          params: { api_key: store.apiKey, language: 'it-IT', region: 'IT' },
        });
        this.popularMovies = response.data.results;
      } catch (error) {
        console.error('Errore nel recupero dei film più visti:', error);
      }
    },
    async fetchHorrorMovies() {
      try {
        const response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
          params: { api_key: store.apiKey, language: 'it-IT', region: 'IT', with_genres: '27' },
        });
        this.horrorMovies = response.data.results;
      } catch (error) {
        console.error('Errore nel recupero dei film horror:', error);
      }
    },
    async fetchRomanticMovies() {
      try {
        const response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
          params: { api_key: store.apiKey, language: 'it-IT', region: 'IT', with_genres: '10749' },
        });
        this.romanticMovies = response.data.results;
      } catch (error) {
        console.error('Errore nel recupero dei film romantici:', error);
      }
    },
    async fetchActionMovies() {
      try {
        const response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
          params: { api_key: store.apiKey, language: 'it-IT', region: 'IT', with_genres: '28' },
        });
        this.actionMovies = response.data.results;
      } catch (error) {
        console.error('Errore nel recupero dei film d\'azione:', error);
      }
    },
    toggleJumboMovieInList() {
      const index = this.store.myList.findIndex(movie => movie.id === this.jumbo_data.id);
      if (index !== -1) {
        this.store.myList.splice(index, 1);
      } else {
        this.store.myList.push(this.jumbo_data);
      }
      console.log(this.store.myList);
    },
    toggleMovieInList(movie) {
      const index = this.store.myList.findIndex(item => item.id === movie.id);
      if (index !== -1) {
        this.store.myList.splice(index, 1);
      } else {
        this.store.myList.push(movie);
      }
      console.log(this.store.myList);
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
          <button class="btn btn-outline-light">
            <i class="fa-solid fa-play"></i> Riproduci
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


    <!-- Sezione Novità su Netflix -->
    <div class="p-3">
      <h2>Novità su Netflix</h2>
      <swiper :slides-per-view="5" :space-between="10" :breakpoints="breakpoints">
        <swiper-slide v-for="movie in movies" :key="movie.id">
          <div class="card">
                    <div class="card-image">
                        <img :src="getImageUrl(movie.poster_path)" alt="">
                    </div>
                    <div class="card-details">
                        <h4>{{ movie.title }}</h4>
                        <p>{{ movie.overview }}</p>
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
        </swiper-slide>
      </swiper>
    </div>

    <!-- Sezione Film più votati -->
    <div class="p-3">
      <h2>Film più votati</h2>
      <swiper :slides-per-view="5" :space-between="10" :breakpoints="breakpoints">
        <swiper-slide v-for="movie in topRatedMovies" :key="movie.id">
          <div class="card">
                    <div class="card-image">
                        <img :src="getImageUrl(movie.poster_path)" alt="">
                    </div>
                    <div class="card-details">
                        <h4>{{ movie.title }}</h4>
                        <p>{{ movie.overview }}</p>
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
        </swiper-slide>
      </swiper>
    </div>

    <!-- Sezione Film più visti -->
    <div class="p-3">
      <h2>Film più visti</h2>
      <swiper :slides-per-view="5" :space-between="10" :breakpoints="breakpoints">
        <swiper-slide v-for="movie in popularMovies" :key="movie.id">
          <div class="card">
                    <div class="card-image">
                        <img :src="getImageUrl(movie.poster_path)" alt="">
                    </div>
                    <div class="card-details">
                        <h4>{{ movie.title }}</h4>
                        <p>{{ movie.overview }}</p>
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
        </swiper-slide>
      </swiper>
    </div>

    <!-- Sezione Film horror -->
    <div class="p-3">
      <h2>Film horror</h2>
      <swiper :slides-per-view="5" :space-between="10" :breakpoints="breakpoints">
        <swiper-slide v-for="movie in horrorMovies" :key="movie.id">
          <div class="card">
                    <div class="card-image">
                        <img :src="getImageUrl(movie.poster_path)" alt="">
                    </div>
                    <div class="card-details">
                        <h4>{{ movie.title }}</h4>
                        <p>{{ movie.overview }}</p>
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
        </swiper-slide>
      </swiper>
    </div>

    <!-- Sezione Film romantici -->
    <div class="p-3">
      <h2>Film romantici</h2>
      <swiper :slides-per-view="5" :space-between="10" :breakpoints="breakpoints">
        <swiper-slide v-for="movie in romanticMovies" :key="movie.id">
          <div class="card">
                    <div class="card-image">
                        <img :src="getImageUrl(movie.poster_path)" alt="">
                    </div>
                    <div class="card-details">
                        <h4>{{ movie.title }}</h4>
                        <p>{{ movie.overview }}</p>
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
        </swiper-slide>
      </swiper>
    </div>

    <!-- Sezione Film d'azione -->
    <div class="p-3">
      <h2>Film d'azione</h2>
      <swiper :slides-per-view="5" :space-between="10" :breakpoints="breakpoints">
        <swiper-slide v-for="movie in actionMovies" :key="movie.id">
          <div class="card">
              <div class="card-image">
                  <img :src="getImageUrl(movie.poster_path)" alt="">
              </div>
              <div class="card-details">
                  <h4>{{ movie.title }}</h4>
                  <p>{{ movie.overview }}</p>
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

.card {
    box-shadow: 0px 0px 20px rgb(0, 0, 0);
    border-radius: 5px;
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
            margin-bottom: 20px;
        }
        p {
            height: 200px;
            overflow: auto;
        }
    }
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: #ffffff;
    overflow: auto;
    height: 100%;
    padding: 10px;
    border-radius: 5px;
    width: 100%;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0);
    position: relative;
}

.close-button {
    position: fixed;
    top: 5px;
    right: 10px;
    font-size: 30px;
    font-weight: 900;
    cursor: pointer;
}

</style>

