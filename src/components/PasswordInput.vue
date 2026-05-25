<script>
/**
 * Campo password con toggle "mostra/nascondi" (eye icon).
 * Usa inheritAttrs: false per passare placeholder, id, autocomplete, ecc. direttamente all'input.
 * Emette 'update:modelValue' per il v-model nel parent.
 */
export default {
  name: 'PasswordInput',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  data() {
    return { visible: false };
  },
};
</script>

<template>
  <div class="pw-input-wrap">
    <input
      v-bind="$attrs"
      :type="visible ? 'text' : 'password'"
      :value="modelValue"
      class="pw-field"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <button
      type="button"
      class="pw-eye"
      :aria-label="visible ? 'Nascondi password' : 'Mostra password'"
      :title="visible ? 'Nascondi' : 'Mostra'"
      @click="visible = !visible"
    >
      <i :class="visible ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
    </button>
  </div>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;

.pw-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.pw-field {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: $radius-sm;
  color: $color-text;
  font-size: 0.95rem;
  padding: 10px 40px 10px 12px; // spazio per l'eye icon a destra
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s ease;

  &::placeholder {
    color: $color-text-dim;
  }

  &:focus {
    border-color: rgba(255, 255, 255, 0.5);
  }
}

.pw-eye {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: $color-text-dim;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  transition: color 0.15s ease;
  flex-shrink: 0;

  &:hover {
    color: $color-text;
  }
}
</style>
