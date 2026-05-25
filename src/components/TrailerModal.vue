<script>
export default {
  name: 'TrailerModal',
  props: {
    show: { type: Boolean, default: false },
    url: { type: String, default: '' },
  },
  emits: ['close'],
};
</script>

<template>
  <div class="modal-overlay" v-if="show" @click.self="$emit('close')">
    <div class="modal-content">
      <span class="close-button" @click="$emit('close')">&times;</span>
      <iframe
        width="100%"
        height="100%"
        :src="url"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
  </div>
</template>
