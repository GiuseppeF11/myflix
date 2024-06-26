<script>
import { store } from '../store';
export default {
    name: 'MyList',
    data() {
        return {
            myMovies: store.myList
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
        }
    },
};
</script>

<template>
    <section class="container-list px-3">
        <h2 class="">La mia lista</h2>
        <h5 class="no-film" v-if="this.myMovies.length == 0">Nessun film presente</h5>
        <div class="row g-0 row-cols-5" v-else>
            <div class="col" v-for="movie in myMovies" :key="movie.id">
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
            </div>
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


</style>
