<script>
import { useSearchStore } from '../stores/search.js';
import ProfileMenu from './ProfileMenu.vue';
import SearchModeToggle from './SearchModeToggle.vue';

export default {
    components: { ProfileMenu, SearchModeToggle },
    setup() {
        const search = useSearchStore();
        return { search };
    },
    data() {
        return {
            isScrolled: false,
        };
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll);
        document.addEventListener('click', this.onOutside);
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
        document.removeEventListener('click', this.onOutside);
    },
    methods: {
        handleScroll() {
            this.isScrolled = window.scrollY > window.innerHeight * 0.1;
        },
        clearSearch() {
            this.search.text = '';
            this.search.clearSuggestions();
        },
        goToPerson(id) {
            this.search.clearSuggestions();
            this.$router.push(`/person/${id}`);
        },
        onOutside(e) {
            const wrapper = this.$refs.searchWrapper;
            if (!wrapper) return;
            // Su mobile il form desktop è nascosto: non interferire col dropdown mobile
            const form = wrapper.querySelector('.desktop-search');
            if (form && getComputedStyle(form).display === 'none') return;
            if (!wrapper.contains(e.target)) {
                this.search.clearSuggestions();
            }
        },
    },
};
</script>

<template>
    <div class="top-bar" :class="{ scrolled: isScrolled }">
        <div class="left">
            <router-link to="/" class="logo-link">
                <img class="logo-netflix" src="/img/logo-myflix.png" alt="MyFlix">
            </router-link>
            <nav class="desktop-nav" aria-label="Navigazione">
                <router-link to="/" :class="{ active: $route.path === '/' }">Home</router-link>
                <router-link to="/film" :class="{ active: $route.path === '/film' }">Film</router-link>
                <router-link to="/series" :class="{ active: $route.path === '/series' }">Serie TV</router-link>
                <router-link to="/my-list" :class="{ active: $route.path === '/my-list' }">Preferiti</router-link>
            </nav>
        </div>

        <div class="right">
            <!-- Barra di ricerca: visibile su desktop in tutte le sezioni -->
            <div class="search-wrapper" ref="searchWrapper">
                <form class="search desktop-search" @submit.prevent>
                    <i class="fa-solid fa-magnifying-glass search-icon"></i>
                    <input
                        type="search"
                        :placeholder="search.searchMode === 'cast' ? 'Cerca un attore…' : 'Cerca film o serie…'"
                        aria-label="Cerca"
                        v-model="search.text"
                    >
                    <button v-if="search.text" class="search-clear-btn" type="button" @click="clearSearch" aria-label="Cancella ricerca">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    <SearchModeToggle class="search-mode" />
                </form>
                <div
                    v-if="search.isCastMode && search.personSuggestions.length > 0"
                    class="suggestions-dropdown"
                >
                    <button
                        v-for="p in search.personSuggestions"
                        :key="p.id"
                        class="suggestion-item"
                        @click="goToPerson(p.id)"
                    >
                        <img
                            :src="`https://image.tmdb.org/t/p/w185${p.profile_path}`"
                            :alt="p.name"
                            class="suggestion-avatar"
                        />
                        <span class="suggestion-name">{{ p.name }}</span>
                    </button>
                </div>
            </div>
            <ProfileMenu />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;

.top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-md;
    height: 100%;
    padding: 0 $space-xl;
    transition: background-color 0.3s linear;
    background: linear-gradient(180deg, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%);

    &.scrolled {
        background: $color-bg;
    }
}

.left {
    display: flex;
    align-items: center;
    gap: $space-xl;
    min-width: 0;
}

.logo-link {
    display: flex;
    align-items: center;
}

.logo-netflix {
    width: 110px;
    max-width: 110px;
}

.desktop-nav {
    display: flex;
    gap: $space-lg;

    a {
        color: $color-text-muted;
        font-size: 0.95rem;
        font-weight: 500;
        text-decoration: none;
        transition: color 0.2s ease;

        &:hover {
            color: $color-text;
        }

        &.active {
            color: $color-text;
            font-weight: 700;
        }
    }
}

.right {
    display: flex;
    align-items: center;
    gap: $space-md;
}

.search {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: rgba(255, 255, 255, 0.07);
    border: 1.5px solid rgba(255, 255, 255, 0.14);
    border-radius: 24px;
    padding: 6px 6px 6px 16px;

    .search-mode { margin-left: 4px; }
    backdrop-filter: blur(10px);
    transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;

    .search-icon {
        color: $color-text-dim;
        font-size: 0.85rem;
        flex-shrink: 0;
        transition: color 0.2s ease;
    }

    input {
        background: none;
        border: none;
        outline: none;
        color: $color-text;
        font-size: 0.9rem;
        width: 180px;
        transition: width 0.25s ease;

        &::placeholder {
            color: $color-text-dim;
        }

        &::-webkit-search-cancel-button {
            display: none;
        }
    }

    .search-clear-btn {
        background: none;
        border: none;
        color: $color-text-dim;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.78rem;
        flex-shrink: 0;
        line-height: 1;
        transition: color 0.15s ease;

        &:hover {
            color: $color-text;
        }
    }

    &:focus-within {
        border-color: rgba(255, 255, 255, 0.5);
        background-color: rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.05);

        .search-icon {
            color: $color-text-muted;
        }

        input {
            width: 240px;
        }
    }
}

.search-wrapper {
    position: relative;
}

// ── Dropdown suggerimenti attori (modalità Cast) ─────────────────────────────
.suggestions-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    background: $color-surface;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.55);
    overflow: hidden;
    z-index: 200;
}

.suggestion-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 12px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    color: $color-text;
    transition: background-color 0.15s ease;

    &:hover { background-color: rgba(255, 255, 255, 0.07); }
    &:not(:last-child) { border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
}

.suggestion-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    background-color: rgba(255, 255, 255, 0.08);
}

.suggestion-name {
    font-size: 0.88rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

// Mobile: niente nav inline (c'è la bottom-nav); la ricerca è nella bottom-nav.
@media (max-width: $bp-lg) {
    .top-bar {
        padding: 0 $space-md;
    }

    .desktop-nav {
        display: none;
    }

    // La ricerca su mobile è nella bottom-nav, non nell'header
    .desktop-search {
        display: none;
    }

    // Il dropdown cast su mobile è gestito da SearchPage, non dall'header
    .suggestions-dropdown {
        display: none;
    }
}
</style>
