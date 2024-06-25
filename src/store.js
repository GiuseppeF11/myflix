import {reactive} from 'vue';

export const store = reactive({
    searchText: '',
    myList: [],
    movies: [],
    series: [],
    apiKey: 'fea43030aa0f8682a48505caa506a1fc',
    movieUrl: 'https://api.themoviedb.org/3/search/movie',
    seriesUrl: 'https://api.themoviedb.org/3/search/tv',
    imgUrl: 'https://image.tmdb.org/t/p/w342/'
});