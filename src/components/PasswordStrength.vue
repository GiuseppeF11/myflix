<script>
import { evaluateRules, passwordStrength } from '../utils/password.js';

/**
 * Mostra la checklist delle regole e la barra di forza della password.
 * Viene montato SOLO quando la password non è vuota (il parent decide con v-if).
 */
export default {
  name: 'PasswordStrength',
  props: {
    password: { type: String, required: true },
  },
  computed: {
    rules() {
      return evaluateRules(this.password);
    },
    strength() {
      return passwordStrength(this.password); // 0-5
    },
    strengthLabel() {
      const labels = ['', 'Molto debole', 'Debole', 'Discreta', 'Buona', 'Ottima'];
      return labels[this.strength] || '';
    },
    strengthClass() {
      if (this.strength <= 1) return 'str-1';
      if (this.strength === 2) return 'str-2';
      if (this.strength === 3) return 'str-3';
      if (this.strength === 4) return 'str-4';
      return 'str-5';
    },
  },
};
</script>

<template>
  <div class="pw-strength">
    <!-- Barra forza -->
    <div class="strength-bar-wrap" aria-hidden="true">
      <div
        v-for="i in 5"
        :key="i"
        class="strength-segment"
        :class="{ filled: i <= strength, [strengthClass]: i <= strength }"
      ></div>
    </div>
    <span class="strength-label" :class="strengthClass">{{ strengthLabel }}</span>

    <!-- Checklist regole -->
    <ul class="rules-list">
      <li
        v-for="rule in rules"
        :key="rule.id"
        class="rule-item"
        :class="{ passed: rule.passed }"
      >
        <i :class="rule.passed ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle'"></i>
        {{ rule.label }}
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
@use '../assets/scss/partials/variables' as *;

.pw-strength {
  margin-top: 10px;
}

// ---- Barra forza ----
.strength-bar-wrap {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}

.strength-segment {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background-color: rgba(255, 255, 255, 0.1);
  transition: background-color 0.2s ease;

  &.filled {
    &.str-1 { background-color: #e53935; }
    &.str-2 { background-color: #fb8c00; }
    &.str-3 { background-color: #fdd835; }
    &.str-4 { background-color: #7cb342; }
    &.str-5 { background-color: #43a047; }
  }
}

.strength-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &.str-1 { color: #e53935; }
  &.str-2 { color: #fb8c00; }
  &.str-3 { color: #fdd835; }
  &.str-4 { color: #7cb342; }
  &.str-5 { color: #43a047; }
}

// ---- Checklist ----
.rules-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rule-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.78rem;
  color: $color-text-dim;
  transition: color 0.2s ease;

  i {
    font-size: 0.72rem;
    width: 12px;
    flex-shrink: 0;
    color: rgba(255, 255, 255, 0.15);
  }

  &.passed {
    color: #6bd17a;

    i {
      color: #43a047;
    }
  }
}
</style>
