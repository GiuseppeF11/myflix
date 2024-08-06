<script>
import { store } from '../store';
import axios from 'axios';

export default {
  name: 'MyList',
  data() {
    return {
      myMovies: store.myList,
      showModal: false,
      trailerUrl: '',
      trailerError: false,
    };
  },
  methods: {
    getImageUrl(image) {
      return `https://image.tmdb.org/t/p/w1280${image}`;
    },
    toggleMovieInList(movie) {
      const index = store.myList.findIndex(item => item.id === movie.id);
      if (index !== -1) {
        store.myList.splice(index, 1);
      } else {
        store.myList.push(movie);
      }
      this.myMovies = [...store.myList];
    },
    isMovieInList(movie) {
      return store.myList.some(item => item.id === movie.id);
    },
    async playMovieTrailer(movie) {
      const videos = await this.fetchVideos(movie.id, movie.media_type || 'movie');
      const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');
      if (trailer) {
        this.trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
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
    async playMovieTrailer(movie) {
    const type = movie.title ? 'movie' : 'tv';
    const videos = await this.fetchVideos(movie.id, type);
    const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');
    if (trailer) {
      this.trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
      this.showModal = true;
    } else {
      this.showTrailerError();
    }
  },
  async fetchVideos(id, type) {
    const endpoint = type === 'movie' ? `https://api.themoviedb.org/3/movie/${id}/videos` : `https://api.themoviedb.org/3/tv/${id}/videos`;
    try {
      const response = await axios.get(endpoint, {
        params: { api_key: store.apiKey }
      });
      return response.data.results;
    } catch (error) {
      console.error('Errore nel recupero dei video:', error);
      return [];
    }
  }
  }
};
</script>

<template>
  <section class="container-list px-3">
    <h2 class="">Preferiti</h2>
    <h5 class="no-film" v-if="myMovies.length === 0">Nessun film presente</h5>
    <div class="row g-0 row-cols-2 row-cols-sm-3 row-cols-md-3 row-cols-lg-5" v-else>
      <div class="col" v-for="movie in myMovies" :key="movie.id">
        <div class="card">
          <div class="card-image">
            <img :src="getImageUrl(movie.poster_path)" v-if="movie.poster_path != null" alt="">
            <img src="https://image.pngaaa.com/321/3555321-small.png" :alt="titleOrName" class="poster" v-else>
          </div>
          <div class="card-details">
            <h4>{{ movie.title ? movie.title : movie.name }}</h4>
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
      </div>
    </div>
    <!-- Modal per il trailer -->
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

    <div class="trailer-error" v-if="trailerError">
      <h2>Trailer non disponibile</h2>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.container-list {
    padding-top: 10vh;
}

.no-film {
  text-align: center;
  font-style: italic; 
}
</style>
