<script>
import {store} from '../store.js'
import SingleElement from './SingleElement.vue'

export default {
    data() {
        return {    
            store,
        };
    },
    components: {
        SingleElement,
    },  
    methods: {
        fixImgUrl(arr) {
            return arr.map(item => {
                if(item.poster_path == null) {
                    item.img_url = null
                } else {
                    item.img_url = this.store.imgUrl + item.poster_path
                }

                return item
            })
        }
    },
}
</script>

<template>
    <main>
        <div class="container">
            <h2>FILM</h2>
            <div>
                <ul>
                    <div class="row row-cols-5 justify-content-around">
                        <li v-for="(movie, i) in fixImgUrl(this.store.movies)" :key="i" class="col m-3">
                        <SingleElement
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
        <div class="container">
            <h2>SERIES</h2>
            <div>
                <ul>
                    <div class="row row-cols-5 justify-content-around">
                        <li v-for="(serie, i) in fixImgUrl(this.store.series)" :key="i" class="col m-3">
                        <SingleElement
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
    </main>
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
