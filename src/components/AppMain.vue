<script>
import { store } from '../store.js';
import SingleElement from './SingleElement.vue';
import Homepage from './Homepage.vue';

export default {
    data() {
        return {    
            store,
        };
    },
    components: {
        SingleElement,
        Homepage,
    },  
    methods: {
        fixImgUrl(arr) {
            return arr.map(item => {
                if (item.poster_path == null) {
                    item.img_url = null;
                } else {
                    item.img_url = this.store.imgUrl + item.poster_path;
                }

                return item;
            });
        }
    },
};
</script>

<template>
    <Homepage/>
    <div v-if="/[a-zA-Z]/.test(store.searchText)" style="padding-top: 10vh;">
        <div class="px-3" v-if="this.store.movies.length > 0">
            <h2>Film</h2>
            <div>
                <ul>
                    <div class="row row-cols-5 justify-content-around">
                        <li v-for="(movie, i) in fixImgUrl(this.store.movies)" :key="i" class="col">
                            <SingleElement
                                :id="movie.id"
                                type="movie"
                                :titleOrName="movie.title"
                                :originalTitleorName="movie.original_title"
                                :originalLanguage="movie.original_language"
                                :voteAverage="movie.vote_average"
                                :poster="movie.img_url"
                                :overview="movie.overview"
                            />
                        </li>
                    </div>
                </ul>
            </div>
        </div>
        <hr>
        <div class="px-3" v-if="this.store.series.length > 0"> 
            <h2>Serie Tv</h2>
            <div>
                <ul>
                    <div class="row row-cols-5 justify-content-around">
                        <li v-for="(serie, i) in fixImgUrl(this.store.series)" :key="i" class="col">
                            <SingleElement
                                :id="serie.id"
                                type="tv"
                                :titleOrName="serie.title"
                                :originalTitleorName="serie.original_title"
                                :originalLanguage="serie.original_language"
                                :voteAverage="serie.vote_average"
                                :poster="serie.img_url"
                                :overview="serie.overview"
                            />
                        </li>
                    </div>
                </ul>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
ul {
    list-style: none;
    padding: 0;
}
.col{
    padding: 0;
}

hr {
    border: 2px solid grey;
}
</style>
