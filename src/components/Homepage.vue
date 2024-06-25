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
      // Altri array di film come popularMovies, horrorMovies, romanticMovies, actionMovies
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
    // Altri metodi di fetch per popularMovies, horrorMovies, romanticMovies, actionMovies
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
    toggleJumboMovieInList() {
      const index = this.store.myList.findIndex(movie => movie.id === this.jumbo_data.id);
      if (index !== -1) {
        this.store.myList.splice(index, 1);
      } else {
        this.store.myList.push(this.jumbo_data);
      }
      console.log(this.store.myList)
    },
    toggleMovieInList(movie) {
      const index = this.store.myList.findIndex(item => item.id === movie.id);
      if (index !== -1) {
        this.store.myList.splice(index, 1);
      } else {
        this.store.myList.push(movie);
      }
      console.log(this.store.myList)
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
              :checked="isJumboMovieInList"
            />
            <label for="jumbo-switch">
              <span class="switch-x-toggletext">
                <span v-if="!isJumboMovieInList" class="switch-x-unchecked">
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
      <h3>Novità su Netflix</h3>
      <swiper :slides-per-view="5" :space-between="10" :breakpoints="breakpoints">
        <swiper-slide v-for="movie in movies" :key="movie.id">
          <section class="card">
            <div class="card-image">
              <img :src="getImageUrl(movie.poster_path)" alt="">
            </div>
            <div class="card-details">
              <h4>{{ movie.original_title }}</h4>
              <div class="d-flex align-items-center gap-3">
                <button class="btn btn-outline-light">Riproduci</button>
                <div class="checkbox-wrapper-35">
                  <input
                    value="private"
                    name="switch"
                    :id="'movie-switch-' + movie.id"
                    type="checkbox"
                    class="switch"
                    @change="toggleMovieInList(movie)"
                    :checked="isMovieInList(movie)"
                  />
                  <label :for="'movie-switch-' + movie.id">
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
              <div class="d-flex align-items-center gap-3">
                <button class="btn btn-outline-light">Riproduci</button>
                <div class="checkbox-wrapper-35">
                  <input
                    value="private"
                    name="switch"
                    :id="'top-rated-switch-' + movie.id"
                    type="checkbox"
                    class="switch"
                    @change="toggleMovieInList(movie)"
                    :checked="isMovieInList(movie)"
                  />
                  <label :for="'top-rated-switch-' + movie.id">
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
      margin-bottom: 20px
    }
    p {
      height: 200px;
      overflow: auto;
    }
  }
}

.info {
    color: grey;
    transition: 0.3s linear;
    cursor: pointer;
    &:hover {
        color: white;
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

//ADD TO LIST 

.checkbox-wrapper-35 .switch {
  display: none;
}

.checkbox-wrapper-35 .switch + label {
  -webkit-box-align: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  color: #e8e8e8;
  cursor: pointer;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 12px;
  line-height: 15px;
  position: relative;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.checkbox-wrapper-35 .switch + label::before,
  .checkbox-wrapper-35 .switch + label::after {
  content: '';
  display: block;
}

.checkbox-wrapper-35 .switch + label::before {
  background-color: #8c8c8e;
  border-radius: 500px;
  height: 15px;
  margin-right: 8px;
  -webkit-transition: background-color 0.125s ease-out;
  transition: background-color 0.125s ease-out;
  width: 25px;
  font-size: 30px;
}

.checkbox-wrapper-35 .switch + label::after {
  background-color: #fff;
  border-radius: 13px;
  box-shadow: 0 3px 1px 0 rgba(37, 34, 71, 0.05), 0 2px 2px 0 rgba(37, 34, 71, 0.1), 0 3px 3px 0 rgba(37, 34, 71, 0.05);
  height: 13px;
  left: 1px;
  position: absolute;
  top: 1px;
  -webkit-transition: -webkit-transform 0.125s ease-out;
  transition: -webkit-transform 0.125s ease-out;
  transition: transform 0.125s ease-out;
  transition: transform 0.125s ease-out, -webkit-transform 0.125s ease-out;
  width: 13px;
}

.checkbox-wrapper-35 .switch + label .switch-x-text {
  display: block;
  margin-right: .3em;
}

.checkbox-wrapper-35 .switch + label .switch-x-toggletext {
  display: block;
  font-weight: bold;
  height: 15px;
  overflow: hidden;
  position: relative;
  width: 300px;
}

.checkbox-wrapper-35 .switch + label .switch-x-unchecked,
  .checkbox-wrapper-35 .switch + label .switch-x-checked {
  left: 0;
  position: absolute;
  top: 0;
  -webkit-transition: opacity 0.125s ease-out, -webkit-transform 0.125s ease-out;
  transition: opacity 0.125s ease-out, -webkit-transform 0.125s ease-out;
  transition: transform 0.125s ease-out, opacity 0.125s ease-out;
  transition: transform 0.125s ease-out, opacity 0.125s ease-out, -webkit-transform 0.125s ease-out;
}

.checkbox-wrapper-35 .switch + label .switch-x-unchecked {
  opacity: 1;
  -webkit-transform: none;
  transform: none;
}

.checkbox-wrapper-35 .switch + label .switch-x-checked {
  opacity: 0;
  -webkit-transform: translate3d(0, 100%, 0);
  transform: translate3d(0, 100%, 0);
}

.checkbox-wrapper-35 .switch + label .switch-x-hiddenlabel {
  position: absolute;
  visibility: hidden;
}

.checkbox-wrapper-35 .switch:checked + label::before {
  background-color: #DB1927;
}

.checkbox-wrapper-35 .switch:checked + label::after {
  -webkit-transform: translate3d(10px, 0, 0);
  transform: translate3d(10px, 0, 0);
}

.checkbox-wrapper-35 .switch:checked + label .switch-x-unchecked {
  opacity: 0;
  -webkit-transform: translate3d(0, -100%, 0);
  transform: translate3d(0, -100%, 0);
}

.checkbox-wrapper-35 .switch:checked + label .switch-x-checked {
  opacity: 1;
  -webkit-transform: none;
  transform: none;
}

</style>

