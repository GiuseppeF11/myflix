<script>
import axios from 'axios';
import { store } from '../store.js';

export default {
    data() {
        return {
            showModal: false,
            trailerUrl: '',
        };
    },
    methods: {
        toggleModal() {
            this.showModal = !this.showModal;
        },
        getEmbedUrl() {
            if (!this.trailerUrl) return '';

            let url = new URL(this.trailerUrl);
            if (url.hostname.includes('youtube.com') && url.searchParams.get('v')) {
                return `https://www.youtube.com/embed/${url.searchParams.get('v')}`;
            } else if (url.hostname.includes('youtu.be')) {
                return `https://www.youtube.com/embed${url.pathname}`;
            }

            return this.trailerUrl;
        },
        async fetchVideos(id, type) {
            try {
                const endpoint = type === 'movie' ? `movie/${id}/videos` : `tv/${id}/videos`;
                const response = await axios.get(`https://api.themoviedb.org/3/${endpoint}`, {
                    params: { api_key: store.apiKey }
                });
                return response.data.results;
            } catch (error) {
                console.error('Errore nel recupero dei video:', error);
                return [];
            }
        },
        async playTrailer(id, type) {
            const videos = await this.fetchVideos(id, type);
            const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');
            if (trailer) {
                this.trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
                this.showModal = true;
            } else {
                alert('Trailer non disponibile');
            }
        },
        toggleMovieInList(movie) {
            const index = store.myList.findIndex(item => item.id === movie.id);
            if (index !== -1) {
                store.myList.splice(index, 1);
            } else {
                // Assicurati di includere tutte le proprietà necessarie
                store.myList.push({
                    id: movie.id,
                    title: movie.titleOrName,
                    name: movie.name, // Se hai un nome alternativo per le serie TV
                    poster_path: movie.poster,
                    overview: movie.overview,
                    type: movie.type
                });
            }
        },
        isMovieInList(movie) {
            return store.myList.some(item => item.id === movie.id);
        }
    },
    props: {
        id: Number,
        type: String,
        titleOrName: String,
        originalTitleorName: String,
        originalLanguage: String,
        voteAverage: Number,
        poster: String,
        overview: String,
    }
}
</script>

<template>
    <section class="card">
        <div class="card-image">
            <img :src="poster" :alt="titleOrName" class="poster" v-if="poster != null">
            <img src="https://image.pngaaa.com/321/3555321-small.png" :alt="titleOrName" class="poster" v-else>
        </div>
        <div class="card-details">
            <div>
                <h4>{{ titleOrName }}</h4>
                <p>{{ overview }}</p>                    
            </div>
            <div class="d-flex align-items-center gap-3" >
                <button class="btn btn-outline-light" @click="playTrailer(id, type)">
                    <i class="fa-solid fa-play"></i>
                </button>
                <div class="checkbox-wrapper-35">
                    <input
                        value="private"
                        name="switch"
                        :id="'switch-' + id"
                        type="checkbox"
                        class="switch"
                        @change="toggleMovieInList({ id, titleOrName, poster, overview, type })"
                        :checked="isMovieInList({ id })"
                    />
                    <label :for="'switch-' + id">
                      <span class="switch-x-toggletext">
                        <span v-if="!isMovieInList({ id })" class="switch-x-unchecked">
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
    
    <!-- Modal per il lettore del trailer -->
    <div v-if="showModal" class="modal-overlay" @click="toggleModal">
        <div class="modal-content" @click.stop>
            <span class="close-button" @click="toggleModal">&times;</span>
            <iframe :src="getEmbedUrl()" width="100%" height="500" frameborder="0" allowfullscreen></iframe>
        </div>
    </div>
</template>

<style lang="scss" scoped>
/* Aggiungi qui il tuo stile */
</style>
