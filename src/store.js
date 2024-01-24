import {reactive} from 'vue';

export const store = reactive({
    searchMovie: '',
    searchTvSeries: '',
    apiKey: 'fea43030aa0f8682a48505caa506a1fc',
    movieUrl: 'https://api.themoviedb.org/3/search/movie',
    tvUrl: 'https://api.themoviedb.org/3/search/tv',
    movies: [],
});