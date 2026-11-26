<script setup lang="ts">
import { useId } from 'vue'

// Casilla nativa con etiqueta visible. Toda la fila (44 px o más) se puede pulsar.
defineProps<{ label: string; hint?: string }>()
const model = defineModel<boolean>({ default: false })

const id = useId()
const hintId = `${id}-ayuda`
</script>

<template>
  <div class="check">
    <input
      :id="id"
      v-model="model"
      type="checkbox"
      class="check__input"
      :aria-describedby="hint ? hintId : undefined"
    />
    <label :for="id" class="check__label">{{ label }}</label>
    <p v-if="hint" :id="hintId" class="check__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.check {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  column-gap: var(--space-3);
}
.check__input {
  width: var(--space-5);
  height: var(--space-5);
  margin: 0;
  accent-color: var(--color-ink);
}
.check__label {
  display: flex;
  align-items: center;
  min-height: var(--tap-min);
  font-weight: 600;
  cursor: pointer;
}
.check__hint {
  grid-column: 2;
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-muted);
  overflow-wrap: anywhere;
}
</style>
