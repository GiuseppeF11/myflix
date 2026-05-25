<script>
export default {
  name: 'LoadingSkeleton',
  props: {
    count: { type: Number, default: 10 },
  },
};
</script>

<template>
  <div class="row g-3 row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5" aria-hidden="true">
    <div class="col" v-for="n in count" :key="n">
      <div class="skeleton-card"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.skeleton-card {
  aspect-ratio: 2 / 3;
  border-radius: 5px;
  background: linear-gradient(100deg, #232323 30%, #2f2f2f 50%, #232323 70%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.2s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
