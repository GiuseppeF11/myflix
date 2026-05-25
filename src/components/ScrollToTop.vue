<script>
export default {
  name: 'ScrollToTop',
  data() {
    return { visible: false };
  },
  mounted() {
    window.addEventListener('scroll', this.onScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  },
  methods: {
    onScroll() {
      this.visible = window.scrollY > 300;
    },
    toTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  },
};
</script>

<template>
  <button v-show="visible" class="scroll-top" @click="toTop" aria-label="Torna su">
    <i class="fa-solid fa-arrow-up"></i>
  </button>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;

.scroll-top {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: $z-header;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background-color: $color-accent;
  color: $color-text;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 2px 10px $color-shadow;
  transition: transform 0.2s ease, opacity 0.2s ease;

  &:hover {
    transform: translateY(-3px);
  }
}

// Sopra la bottom-nav su mobile.
@media (max-width: $bp-lg) {
  .scroll-top {
    bottom: 78px;
  }
}
</style>
