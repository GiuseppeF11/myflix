<script>
import axios from 'axios';
import { store } from '../store';

export default {
    data() {
        return {
            store,
            series: [],
            currentPage: 1,
            totalPages: 0,
            showModal: false,
            trailerUrl: '',
            trailerError: false,
        };
    },
    computed: {
        displayedSeries() {
            const start = (this.currentPage - 1) * 20;
            const end = this.currentPage * 20;
            return this.series.slice(start, end);
        }
    },
    methods: {
        getImageUrl(image) {
            return `https://image.tmdb.org/t/p/w1280${image}`;
        },
        async fetchSeries() {
            try {
                const response = await axios.get('https://api.themoviedb.org/3/tv/popular', {
                    params: { api_key: store.apiKey, language: 'it-IT', region: 'IT', page: this.currentPage },
                });

                // Concatenazione delle serie alla lista corrente
                this.series = [...this.series, ...response.data.results];

                // Aggiornamento del numero totale di pagine
                this.totalPages = response.data.total_pages;
            } catch (error) {
                console.error('Errore nel recupero delle serie TV:', error);
            }
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.fetchSeries();
            }
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.fetchSeries();
            }
        },
        toggleTvInList(tv) {
            const index = store.myList.findIndex(item => item.id === tv.id);
            if (index !== -1) {
                store.myList.splice(index, 1);
            } else {
                store.myList.push(tv);
            }
        },
        isTvInList(tv) {
            return store.myList.some(item => item.id === tv.id);
        },
        async playTvTrailer(tv) {
            const videos = await this.fetchTvVideos(tv.id);
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
        async fetchTvVideos(tvId) {
            try {
                const response = await axios.get(`https://api.themoviedb.org/3/tv/${tvId}/videos`, {
                    params: { api_key: store.apiKey }
                });
                return response.data.results;
            } catch (error) {
                console.error('Errore nel recupero dei video della serie TV:', error);
                return [];
            }
        }
    },
    mounted() {
        this.fetchSeries();
    },
};
</script>


<template>
    <section class="container-film">
        <h2>Serie TV</h2>
        <div class="row g-0 row-cols-2 row-cols-sm-3 row-cols-md-3 row-cols-lg-5">
            <div class="col" v-for="tv in displayedSeries" :key="tv.id">
                <div class="card">
                    <div class="card-image">
                        <img :src="getImageUrl(tv.poster_path)" alt="">
                    </div>
                    <div class="card-details">
                        <h4>{{ tv.name }}</h4>
                        <p>{{ tv.overview }}</p>
                        <div class="d-flex align-items-center gap-3">
                            <button class="btn btn-outline-light trailer_button" @click="playTvTrailer(tv)">
                                <i class="fa-solid fa-play"></i>
                            </button>
                            <div class="checkbox-wrapper-35">
                                <input
                                    value="private"
                                    name="switch"
                                    :id="'switch-' + tv.id"
                                    type="checkbox"
                                    class="switch"
                                    @change="toggleTvInList(tv)"
                                    :checked="isTvInList(tv)"
                                />
                                <label :for="'switch-' + tv.id">
                                    <span class="switch-x-toggletext">
                                        <span v-if="!isTvInList(tv)" class="switch-x-unchecked">
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
        <div class="pagination">
            <button class="btn btn-outline-light" @click="prevPage" :disabled="currentPage === 1"><i class="fa-solid fa-arrow-left"></i></button>
            <span> {{ currentPage }} di {{ totalPages }}</span>
            <button class="btn btn-outline-light" @click="nextPage" :disabled="currentPage === totalPages"><i class="fa-solid fa-arrow-right"></i></button>
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
.container-film {
    padding: 10vh 15px;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    button {
        margin: 0 10px;
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
        &:disabled {
            cursor: not-allowed;
            opacity: 0.5;
        }
    }
    span {
        font-size: 16px;
    }
}
</style>
