<script>
import { useSearchStore } from '../stores/search.js';

/**
 * Toggle "Cerca per": Titolo | Cast.
 * Bind allo store così desktop (header) e mobile (SearchPage) restano sincronizzati.
 */
export default {
  name: 'SearchModeToggle',
  setup() {
    return { search: useSearchStore() };
  },
  methods: {
    select(mode) {
      if (this.search.searchMode === mode) return;
      this.search.setSearchMode(mode);
      this.search.run();
    },
  },
};
</script>

<template>
  <div class="mode-toggle" role="group" aria-label="Cerca per">
    <button
      type="button"
      class="mode-opt"
      :class="{ active: search.searchMode === 'title' }"
      :aria-pressed="search.searchMode === 'title'"
      aria-label="Cerca per titolo"
      @click="select('title')"
    >
      <i class="fa-solid fa-clapperboard"></i>
    </button>
    <button
      type="button"
      class="mode-opt"
      :class="{ active: search.searchMode === 'cast' }"
      :aria-pressed="search.searchMode === 'cast'"
      aria-label="Cerca per cast"
      @click="select('cast')"
    >
      <i class="fa-solid fa-user"></i>
    </button>
  </div>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;

.mode-toggle {
  display: inline-flex;
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 20px;
  padding: 2px;
  flex-shrink: 0;
}

.mode-opt {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: $color-text-dim;
  font-size: 0.78rem;
  padding: 5px 9px;
  border-radius: 18px;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;

  &:hover { color: $color-text; }

  &.active {
    background-color: $color-accent;
    color: $color-text;
  }
}
</style>
