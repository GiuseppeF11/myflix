<script>
/**
 * Barra filtri riutilizzabile: generi (multi-select) + ordinamento + piattaforma.
 * Può essere usata in SearchPage, Film.vue, Series.vue e MyList.vue.
 */
export default {
  name: 'SearchFilters',
  props: {
    genresList:    { type: Array, default: () => [] },
    genres:        { type: Array, default: () => [] },
    sortBy:        { type: String, default: 'popularity' },
    sortOrder:     { type: String, default: 'desc' },
    providersList: { type: Array, default: () => [] },  // [{ provider_id, provider_name, logo_path }]
    providers:     { type: Array, default: () => [] },  // ID selezionati (può includere 'cinema')
    showGenres:    { type: Boolean, default: true },
    showSort:      { type: Boolean, default: true },
  },
  emits: ['update:genres', 'update:sortBy', 'update:sortOrder', 'update:providers'],
  data() {
    return {
      genreOpen:    false,
      sortOpen:     false,
      providerOpen: false,
    };
  },
  mounted() {
    document.addEventListener('click', this.onOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.onOutside);
  },
  methods: {
    onOutside(e) {
      if (this.genreOpen && this.$refs.genreDropdown && !this.$refs.genreDropdown.contains(e.target)) {
        this.genreOpen = false;
      }
      if (this.sortOpen && this.$refs.sortDropdown && !this.$refs.sortDropdown.contains(e.target)) {
        this.sortOpen = false;
      }
      if (this.providerOpen && this.$refs.providerDropdown && !this.$refs.providerDropdown.contains(e.target)) {
        this.providerOpen = false;
      }
    },
    toggleGenre(id) {
      const updated = this.genres.includes(id)
        ? this.genres.filter((g) => g !== id)
        : [...this.genres, id];
      this.$emit('update:genres', updated);
    },
    clearGenres() {
      this.$emit('update:genres', []);
    },
    selectSort(val) {
      this.$emit('update:sortBy', val);
      this.sortOpen = false;
    },
    toggleOrder() {
      this.$emit('update:sortOrder', this.sortOrder === 'desc' ? 'asc' : 'desc');
    },
    toggleProvider(id) {
      const updated = this.providers.includes(id)
        ? this.providers.filter((p) => p !== id)
        : [...this.providers, id];
      this.$emit('update:providers', updated);
    },
    clearProviders() {
      this.$emit('update:providers', []);
    },
  },
  computed: {
    currentSortLabel() {
      const opt = this.sortOptions.find((o) => o.value === this.sortBy);
      return opt ? opt.label : 'Ordina';
    },
    sortOptions() {
      return [
        { value: 'popularity',   label: 'Popolarità'  },
        { value: 'release_date', label: 'Data uscita' },
        { value: 'vote_average', label: 'Valutazione' },
      ];
    },
    // Mostra il dropdown solo se c'è almeno un provider disponibile
    hasProviders() {
      return this.providersList.length > 0;
    },
  },
};
</script>

<template>
  <div class="search-filters">

    <!-- ── Categorie (multi-select) ── -->
    <div v-if="showGenres" class="filter-group" ref="genreDropdown">
      <button
        class="filter-btn"
        :class="{ 'filter-btn--active': genres.length > 0 }"
        @click="genreOpen = !genreOpen"
        aria-haspopup="listbox"
      >
        <i class="fa-solid fa-tags"></i>
        <span v-if="genres.length === 0">Categorie</span>
        <span v-else class="active-label">{{ genres.length }} categor{{ genres.length === 1 ? 'ia' : 'ie' }}</span>
        <i class="fa-solid" :class="genreOpen ? 'fa-chevron-up' : 'fa-chevron-down'" style="font-size:0.65rem"></i>
      </button>

      <div v-if="genreOpen" class="dropdown-panel" role="listbox" aria-multiselectable="true">
        <div class="panel-header">
          <span class="panel-title">Filtra per categoria</span>
          <button v-if="genres.length > 0" class="clear-btn" @click.stop="clearGenres">Rimuovi tutti</button>
        </div>
        <div class="panel-list genre-list">
          <label
            v-for="g in genresList"
            :key="g.id"
            class="panel-item"
            :class="{ 'panel-item--selected': genres.includes(g.id) }"
          >
            <input
              type="checkbox"
              :value="g.id"
              :checked="genres.includes(g.id)"
              @change="toggleGenre(g.id)"
              class="visually-hidden"
            />
            <span class="item-check">
              <i v-if="genres.includes(g.id)" class="fa-solid fa-check"></i>
            </span>
            {{ g.name }}
          </label>
        </div>
      </div>
    </div>

    <!-- ── Piattaforma (multi-select) ── -->
    <div v-if="hasProviders" class="filter-group" ref="providerDropdown">
      <button
        class="filter-btn"
        :class="{ 'filter-btn--active': providers.length > 0 }"
        @click="providerOpen = !providerOpen"
        aria-haspopup="listbox"
      >
        <i class="fa-solid fa-tv"></i>
        <span v-if="providers.length === 0">Piattaforma</span>
        <span v-else class="active-label">{{ providers.length }} piattaform{{ providers.length === 1 ? 'a' : 'e' }}</span>
        <i class="fa-solid" :class="providerOpen ? 'fa-chevron-up' : 'fa-chevron-down'" style="font-size:0.65rem"></i>
      </button>

      <div v-if="providerOpen" class="dropdown-panel provider-panel" role="listbox" aria-multiselectable="true">
        <div class="panel-header">
          <span class="panel-title">Filtra per piattaforma</span>
          <button v-if="providers.length > 0" class="clear-btn" @click.stop="clearProviders">Rimuovi tutti</button>
        </div>
        <div class="panel-list provider-list">
          <label
            v-for="p in providersList"
            :key="p.provider_id"
            class="panel-item"
            :class="{ 'panel-item--selected': providers.includes(p.provider_id) }"
          >
            <input
              type="checkbox"
              :value="p.provider_id"
              :checked="providers.includes(p.provider_id)"
              @change="toggleProvider(p.provider_id)"
              class="visually-hidden"
            />
            <!-- Cinema: icona FA invece del logo -->
            <span v-if="p.provider_id === 'cinema'" class="provider-icon-cinema">
              <i class="fa-solid fa-film"></i>
            </span>
            <img
              v-else
              :src="`https://image.tmdb.org/t/p/w45${p.logo_path}`"
              :alt="p.provider_name"
              class="provider-logo-sm"
            />
            <span class="provider-name">{{ p.provider_name }}</span>
            <span class="item-check">
              <i v-if="providers.includes(p.provider_id)" class="fa-solid fa-check"></i>
            </span>
          </label>
        </div>
      </div>
    </div>

    <!-- ── Ordina per (dropdown custom) ── -->
    <div v-if="showSort" class="filter-group" ref="sortDropdown">
      <button
        class="filter-btn"
        :class="{ 'filter-btn--active': sortBy !== 'popularity' }"
        @click="sortOpen = !sortOpen"
        aria-haspopup="listbox"
      >
        <i class="fa-solid fa-arrow-up-wide-short"></i>
        <span>{{ currentSortLabel }}</span>
        <i class="fa-solid" :class="sortOpen ? 'fa-chevron-up' : 'fa-chevron-down'" style="font-size:0.65rem"></i>
      </button>

      <div v-if="sortOpen" class="dropdown-panel" role="listbox">
        <div class="panel-header">
          <span class="panel-title">Ordina per</span>
        </div>
        <div class="panel-list">
          <label
            v-for="opt in sortOptions"
            :key="opt.value"
            class="panel-item"
            :class="{ 'panel-item--selected': sortBy === opt.value }"
            @click.prevent="selectSort(opt.value)"
          >
            <span class="item-check item-check--radio">
              <i v-if="sortBy === opt.value" class="fa-solid fa-check"></i>
            </span>
            {{ opt.label }}
          </label>
        </div>
      </div>
    </div>

    <!-- ── Direzione asc / desc ── -->
    <button v-if="showSort"
      class="order-btn"
      :class="{ 'order-btn--active': sortOrder !== 'desc' }"
      :title="sortOrder === 'desc' ? 'Ordine decrescente' : 'Ordine crescente'"
      @click="toggleOrder"
    >
      <i class="fa-solid" :class="sortOrder === 'desc' ? 'fa-arrow-down-wide-short' : 'fa-arrow-up-short-wide'"></i>
    </button>

  </div>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;

.search-filters {
  display: flex;
  align-items: center;
  gap: $space-sm;
  flex-wrap: wrap;
}

// ── Wrapper dropdown ────────────────────────────────────────────────────────
.filter-group {
  position: relative;
}

// ── Bottone pill generico ──────────────────────────────────────────────────
.filter-btn {
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
  white-space: nowrap;

  &:hover {
    border-color: rgba(255, 255, 255, 0.55);
    color: $color-text;
  }

  &--active {
    background-color: $color-text;
    border-color: $color-text;
    color: #000;
    font-weight: 700;

    .active-label { color: #000; }

    &:hover {
      color: #000;
      border-color: $color-text;
    }
  }
}

// ── Pannello dropdown condiviso ────────────────────────────────────────────
.dropdown-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 200;
  min-width: 200px;
  max-height: 340px;
  display: flex;
  flex-direction: column;
  background-color: rgba(20, 20, 20, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: $radius-md;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.provider-panel {
  min-width: 240px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.panel-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: $color-text-dim;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.clear-btn {
  background: none;
  border: none;
  color: $color-accent;
  font-size: 0.78rem;
  cursor: pointer;
  padding: 0;
  &:hover { text-decoration: underline; }
}

.panel-list {
  padding: 6px 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.15) transparent;
}

.genre-list,
.provider-list {
  overflow-y: auto;
}

.panel-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 8px;
  border-radius: $radius-sm;
  cursor: pointer;
  font-size: 0.88rem;
  color: $color-text-muted;
  transition: background-color 0.12s ease, color 0.12s ease;
  user-select: none;

  &:hover {
    background-color: rgba(255, 255, 255, 0.07);
    color: $color-text;
  }

  &--selected {
    color: $color-text;
    font-weight: 600;
  }
}

// ── Logo provider (piccolo, nella lista) ───────────────────────────────────
.provider-logo-sm {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.provider-icon-cinema {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background-color: rgba(219, 25, 39, 0.2);
  color: #ff6b78;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  flex-shrink: 0;
}

// ── Nome provider (prende lo spazio residuo, check rimane a destra) ────────
.provider-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ── Indicatore checkbox/radio ──────────────────────────────────────────────
.item-check {
  width: 16px;
  height: 16px;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.62rem;
  color: $color-accent;
  background-color: transparent;
  transition: border-color 0.12s ease, background-color 0.12s ease;

  .panel-item--selected & {
    border-color: $color-accent;
    background-color: rgba(219, 25, 39, 0.15);
  }

  // Variante radio (tondo) per l'ordinamento
  &--radio {
    border-radius: 50%;
  }
}

// ── Bottone direzione ──────────────────────────────────────────────────────
.order-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: $color-text-muted;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.55);
    color: $color-text;
  }

  &--active {
    background-color: $color-text;
    border-color: $color-text;
    color: #000;

    &:hover {
      color: #000;
      border-color: $color-text;
    }
  }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
