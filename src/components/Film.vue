<script>
import { getPopularMovies } from '../services/tmdb.js';
import MovieCard from './MovieCard.vue';
import Pagination from './Pagination.vue';
import LoadingSkeleton from './LoadingSkeleton.vue';

export default {
    components: { MovieCard, Pagination, LoadingSkeleton },
    data() {
        return {
            movies: [],
            currentPage: 1,
            totalPages: 0,
            loading: false,
        };
    },
    methods: {
        async fetchMovies() {
            this.loading = true;
            try {
                const data = await getPopularMovies(this.currentPage);
                this.movies = data.results;
                this.totalPages = Math.min(data.total_pages, 500); // TMDB: max pagina = 500
            } catch (error) {
                console.error('Errore nel recupero dei film:', error);
            } finally {
                this.loading = false;
            }
        },
        goToPage(page) {
            this.currentPage = page;
            this.fetchMovies();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
    },
    mounted() {
        this.fetchMovies();
    },
};
</script>

<template>
    <section class="container-film">
        <h2>Film</h2>
        <LoadingSkeleton v-if="loading" />
        <div v-else class="card-grid">
            <div v-for="movie in movies" :key="movie.id">
                <MovieCard :item="movie" media-type="movie" />
            </div>
        </div>
        <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            @prev="goToPage(currentPage - 1)"
            @next="goToPage(currentPage + 1)"
        />
    </section>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;

.container-film {
    padding: 12vh 40px 40px;

    h2 {
        font-weight: 700;
        margin-bottom: 24px;
    }
}

.card-grid {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(3, 1fr);

    @media (min-width: 480px)  { grid-template-columns: repeat(4, 1fr); }
    @media (min-width: 768px)  { grid-template-columns: repeat(5, 1fr); }
    @media (min-width: 992px)  { grid-template-columns: repeat(6, 1fr); }
    @media (min-width: 1280px) { grid-template-columns: repeat(7, 1fr); }
}

@media (max-width: 768px) {
    .container-film {
        padding: 12vh 16px 32px;
    }
}
</style>
