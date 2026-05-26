<script>
import { discoverTv, getGenres } from '../services/tmdb.js';
import { hasRequiredData } from '../utils/media.js';
import MovieCard from './MovieCard.vue';
import Pagination from './Pagination.vue';
import LoadingSkeleton from './LoadingSkeleton.vue';
import SearchFilters from './SearchFilters.vue';

export default {
    components: { MovieCard, Pagination, LoadingSkeleton, SearchFilters },
    data() {
        return {
            series: [],
            currentPage: 1,
            totalPages: 0,
            loading: false,
            genresList: [],
            genres: [],
            sortBy: 'popularity',
            sortOrder: 'desc',
        };
    },
    computed: {
        sortParam() {
            // TMDB /discover/tv usa 'first_air_date', non 'release_date'
            const field = this.sortBy === 'release_date' ? 'first_air_date' : this.sortBy;
            return `${field}.${this.sortOrder}`;
        },
    },
    methods: {
        async fetchSeries() {
            this.loading = true;
            try {
                const params = {
                    page: this.currentPage,
                    sort_by: this.sortParam,
                };
                if (this.genres.length) params.with_genres = this.genres.join(',');
                if (this.sortBy === 'vote_average') params['vote_count.gte'] = 200;
                const data = await discoverTv(params);
                this.series = (data.results || []).filter(hasRequiredData);
                this.totalPages = Math.min(data.total_pages, 500);
            } catch (error) {
                console.error('Errore nel recupero delle serie TV:', error);
            } finally {
                this.loading = false;
            }
        },
        goToPage(page) {
            this.currentPage = page;
            this.fetchSeries();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        onGenresChange(val) {
            this.genres = val;
            this.currentPage = 1;
            this.fetchSeries();
        },
        onSortByChange(val) {
            this.sortBy = val;
            this.currentPage = 1;
            this.fetchSeries();
        },
        onSortOrderChange(val) {
            this.sortOrder = val;
            this.currentPage = 1;
            this.fetchSeries();
        },
    },
    async mounted() {
        const [, genres] = await Promise.all([
            this.fetchSeries(),
            getGenres('tv'),
        ]);
        this.genresList = genres;
    },
};
</script>

<template>
    <section class="container-film">
        <div class="page-header">
            <h2>Serie TV</h2>
            <SearchFilters
                :genres-list="genresList"
                :genres="genres"
                :sort-by="sortBy"
                :sort-order="sortOrder"
                @update:genres="onGenresChange"
                @update:sort-by="onSortByChange"
                @update:sort-order="onSortOrderChange"
            />
        </div>
        <LoadingSkeleton v-if="loading" />
        <div v-else class="card-grid">
            <div v-for="tv in series" :key="tv.id">
                <MovieCard :item="tv" media-type="tv" />
            </div>
            <div v-for="n in 6" :key="'fill-' + n" class="card-fill" aria-hidden="true"></div>
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
}

.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: $space-md;
    margin-bottom: 24px;

    h2 {
        font-weight: 700;
        margin: 0;
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

.card-fill {
    visibility: hidden;
    pointer-events: none;
}

@media (max-width: 768px) {
    .container-film {
        padding: 12vh 16px 32px;
    }
    .page-header {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>
