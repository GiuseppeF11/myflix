<script>
export default {
  name: 'Pagination',
  props: {
    currentPage: { type: Number, required: true },
    totalPages: { type: Number, required: true },
  },
  emits: ['prev', 'next'],
};
</script>

<template>
  <div class="pagination" v-if="totalPages > 1">
    <button class="btn btn-outline-light" @click="$emit('prev')" :disabled="currentPage === 1" aria-label="Pagina precedente">
      <i class="fa-solid fa-arrow-left"></i>
    </button>
    <span>{{ currentPage }} di {{ totalPages }}</span>
    <button class="btn btn-outline-light" @click="$emit('next')" :disabled="currentPage === totalPages" aria-label="Pagina successiva">
      <i class="fa-solid fa-arrow-right"></i>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;

  button {
    margin: 0 10px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  span {
    font-size: 16px;
  }
}
</style>
