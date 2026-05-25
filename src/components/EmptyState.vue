<script>
export default {
  name: 'EmptyState',
  props: {
    icon: { type: String, default: 'fa-film' },
    message: { type: String, required: true },
  },
};
</script>

<template>
  <div class="empty-state">
    <i :class="['fa-solid', icon]"></i>
    <p>{{ message }}</p>
  </div>
</template>

<style lang="scss" scoped>
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #919191;

  i {
    font-size: 48px;
    margin-bottom: 16px;
    display: block;
  }

  p {
    font-size: 1.1rem;
    font-style: italic;
  }
}
</style>
