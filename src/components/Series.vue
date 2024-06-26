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
        };
    },
    computed: {
        displayedSeries() {
            const start = (this.currentPage - 1) * 25;
            const end = this.currentPage * 25;
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
        toggleMovieInList(movie) {
            const index = store.myList.findIndex(item => item.id === movie.id);
            if (index !== -1) {
                store.myList.splice(index, 1);
            } else {
                store.myList.push(movie);
            }
        },
        isMovieInList(movie) {
            return store.myList.some(item => item.id === movie.id);
        }
        
    },
    mounted() {
        this.fetchSeries();
    },
};
</script>


<template>
    <section class="container-film">
        <h2>Serie Tv</h2>
        <div class="row g-0 row-cols-5">
            <div class="col" v-for="tv in displayedSeries" :key="tv.id">
                <div class="card">
                    <div class="card-image">
                        <img :src="getImageUrl(tv.poster_path)" alt="">
                    </div>
                    <div class="card-details">
                        <h4>{{ tv.name }}</h4>
                        <p>{{ tv.overview }}</p>
                        <div class="checkbox-wrapper-35">
                            <input
                                value="private"
                                name="switch"
                                :id="'switch-' + tv.id"
                                type="checkbox"
                                class="switch"
                                @change="toggleMovieInList(tv)"
                                :checked="isMovieInList(tv)"
                            />
                            <label :for="'switch-' + tv.id">
                                <span class="switch-x-toggletext">
                                    <span v-if="!isMovieInList(tv)" class="switch-x-unchecked">
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
        <div class="pagination">
            <button class="btn btn-outline-light" @click="prevPage" :disabled="currentPage === 1">Prev</button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button class="btn btn-outline-light" @click="nextPage" :disabled="currentPage === totalPages">Next</button>
        </div>

    </section>
</template>




<style lang="scss" scoped>
.container-film {
    padding: 10vh 15px;
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
