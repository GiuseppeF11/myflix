<script>
import MovieCard from './MovieCard.vue';
import Homepage from './Homepage.vue';
import { useSearchStore } from '../stores/search.js';

export default {
    name: 'AppMain',
    setup() {
        const search = useSearchStore();
        return { search };
    },
    components: {
        MovieCard,
        Homepage,
    },
    computed: {
        hasQuery() {
            return this.search.text.trim().length > 0;
        },
        // Chip dati: label, valore filtro, conteggio risultati
        filterChips() {
            return [
                { value: 'all',   label: 'Tutti',    count: this.search.totalCount },
                { value: 'movie', label: 'Film',     count: this.search.movies.length },
                { value: 'tv',    label: 'Serie TV', count: this.search.series.length },
            ];
        },
        showMovies() {
            return this.search.visibleMovies.length > 0;
        },
        showSeries() {
            return this.search.visibleSeries.length > 0;
        },
        showNoResults() {
            return !this.search.loading && !this.search.hasResults;
        },
        showFilteredEmpty() {
            return (
                !this.search.loading &&
                this.search.hasResults &&
                !this.showMovies &&
                !this.showSeries
            );
        },
    },
};
</script>

<template>
    <!-- Home hero + carousel rows -->
    <Homepage />

    <!-- Risultati di ricerca (overlay la home quando si digita) -->
    <div v-if="hasQuery" class="search-results">

        <!-- Header: query + filtri -->
        <div class="search-header">
            <p class="search-query">
                <template v-if="search.loading">Ricerca in corso…</template>
                <template v-else-if="search.hasResults">
                    <span class="query-label">Risultati per</span>
                    <strong>"{{ search.text }}"</strong>
                </template>
                <template v-else>
                    Nessun risultato per <strong>"{{ search.text }}"</strong>
                </template>
            </p>

            <!-- Chips filtro — visibili solo se ci sono risultati -->
            <div v-if="search.hasResults" class="filter-chips" role="group" aria-label="Filtra risultati">
                <button
                    v-for="chip in filterChips"
                    :key="chip.value"
                    class="filter-chip"
                    :class="{ active: search.filter === chip.value }"
                    @click="search.setFilter(chip.value)"
                    :disabled="chip.count === 0 && chip.value !== 'all'"
                    :aria-pressed="search.filter === chip.value"
                >
                    {{ chip.label }}
                    <span class="chip-count">{{ chip.count }}</span>
                </button>
            </div>
        </div>

        <!-- Messaggio filtro attivo senza risultati (es. filtro "Film" ma ci sono solo serie) -->
        <p v-if="showFilteredEmpty" class="filter-empty">
            Nessun risultato per questa categoria. Prova con "Tutti".
        </p>

        <!-- Sezione Film -->
        <section v-if="showMovies" class="result-section">
            <div class="section-header" v-if="search.filter === 'all'">
                <span class="section-badge badge-movie">
                    <i class="fa-solid fa-film"></i> Film
                </span>
                <span class="section-count">{{ search.movies.length }} risultat{{ search.movies.length === 1 ? 'o' : 'i' }}</span>
            </div>
            <div class="card-grid">
                <div v-for="movie in search.visibleMovies" :key="movie.id">
                    <MovieCard :item="movie" media-type="movie" show-type-badge />
                </div>
            </div>
        </section>

        <!-- Separatore visivo tra le due sezioni (solo in modalità "Tutti") -->
        <hr v-if="search.filter === 'all' && showMovies && showSeries" class="section-divider" />

        <!-- Sezione Serie TV -->
        <section v-if="showSeries" class="result-section">
            <div class="section-header" v-if="search.filter === 'all'">
                <span class="section-badge badge-tv">
                    <i class="fa-solid fa-tv"></i> Serie TV
                </span>
                <span class="section-count">{{ search.series.length }} risultat{{ search.series.length === 1 ? 'o' : 'i' }}</span>
            </div>
            <div class="card-grid">
                <div v-for="serie in search.visibleSeries" :key="serie.id">
                    <MovieCard :item="serie" media-type="tv" show-type-badge />
                </div>
            </div>
        </section>
    </div>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;

.search-results {
    position: relative;
    z-index: 1;
    padding: 12vh 24px 60px;
    background-color: $color-bg;
    min-height: 100vh;
}

// ---- Header ----
.search-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: $space-md;
    margin-bottom: $space-lg;
}

.search-query {
    margin: 0;
    font-size: 1rem;
    color: $color-text-muted;

    .query-label {
        margin-right: 4px;
    }

    strong {
        color: $color-text;
    }
}

// ---- Chips filtro ----
.filter-chips {
    display: flex;
    gap: $space-sm;
    flex-wrap: wrap;
}

.filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1.5px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    background: transparent;
    color: $color-text-muted;
    font-size: 0.85rem;
    font-weight: 500;
    padding: 5px 14px;
    cursor: pointer;
    transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;

    &:hover:not(:disabled) {
        border-color: rgba(255, 255, 255, 0.55);
        color: $color-text;
    }

    &.active {
        background-color: $color-text;
        border-color: $color-text;
        color: #000;
        font-weight: 700;

        .chip-count {
            color: rgba(0, 0, 0, 0.5);
        }
    }

    &:disabled {
        opacity: 0.35;
        cursor: not-allowed;
    }
}

.chip-count {
    font-size: 0.75rem;
    color: $color-text-dim;
    font-weight: 400;
}

// ---- Grid card ----
.card-grid {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(3, 1fr);

    @media (min-width: 480px)  { grid-template-columns: repeat(4, 1fr); }
    @media (min-width: 768px)  { grid-template-columns: repeat(5, 1fr); }
    @media (min-width: 992px)  { grid-template-columns: repeat(6, 1fr); }
    @media (min-width: 1280px) { grid-template-columns: repeat(7, 1fr); }
}

// ---- Intestazione sezione ----
.result-section {
    margin-bottom: $space-xl;
}

.section-header {
    display: flex;
    align-items: center;
    gap: $space-md;
    margin-bottom: $space-md;
}

.section-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 1rem;
    font-weight: 700;
    padding: 4px 14px;
    border-radius: 4px;

    i {
        font-size: 0.9rem;
    }

    &.badge-movie {
        background-color: rgba(219, 25, 39, 0.18);
        color: #ff6b78;
        border-left: 3px solid $color-accent;
    }

    &.badge-tv {
        background-color: rgba(100, 149, 237, 0.15);
        color: #7eb5ff;
        border-left: 3px solid #6495ed;
    }
}

.section-count {
    font-size: 0.85rem;
    color: $color-text-dim;
}

.section-divider {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    margin: $space-xl 0;
}

.filter-empty,
.no-results {
    text-align: center;
    font-style: italic;
    color: $color-text-dim;
    padding: 40px 0;
}

@media (max-width: $bp-md) {
    .search-results {
        padding: 12vh 16px 60px;
    }

    .search-header {
        flex-direction: column;
        gap: $space-sm;
    }
}
</style>
