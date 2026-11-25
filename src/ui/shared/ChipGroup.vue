<script setup lang="ts">
import { useId } from 'vue'
import AppIcon from './AppIcon.vue'
import type { Option } from './types'

// Selector en chips.
// - Selección única (por defecto): v-model es un texto, por dentro son botones radio.
// - Selección múltiple (multiple): v-model es una lista, por dentro son casillas.
// Usar controles nativos hace que funcione con teclado y lector de pantalla
// igual en iPhone y en Android.
const props = defineProps<{
  legend: string
  options: Option[]
  multiple?: boolean
}>()

const model = defineModel<string | string[]>({ required: true })

// Nombre común de los radios del grupo (único en la página).
const name = useId()

function isChecked(value: string): boolean {
  return Array.isArray(model.value) ? model.value.includes(value) : model.value === value
}

function toggle(value: string): void {
  if (!props.multiple) {
    model.value = value
    return
  }
  const list = Array.isArray(model.value) ? model.value : []
  model.value = list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}
</script>

<template>
  <fieldset class="chips">
    <legend class="chips__legend">{{ legend }}</legend>
    <div class="chips__list">
      <label
        v-for="option in options"
        :key="option.value"
        class="chip"
        :class="{ 'chip--on': isChecked(option.value) }"
      >
        <input
          class="chip__input"
          :type="multiple ? 'checkbox' : 'radio'"
          :name="name"
          :value="option.value"
          :checked="isChecked(option.value)"
          @change="toggle(option.value)"
        />
        <!-- Elegido: se marca con ✓ además del color -->
        <AppIcon v-if="isChecked(option.value)" name="check" />
        <AppIcon v-else-if="option.icon" :name="option.icon" />
        <span>{{ option.label }}</span>
      </label>
    </div>
  </fieldset>
</template>

<style scoped>
.chips {
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}
.chips__legend {
  padding: 0;
  margin-bottom: var(--space-3);
  font-weight: 600;
}
.chips__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--tap-min);
  padding: 0 var(--space-4);
  border: 1px solid var(--color-field-border);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: var(--text-base); /* 16 px o más */
  cursor: pointer;
  transition:
    background-color 150ms var(--ease),
    color 150ms var(--ease);
}
.chip--on {
  background: var(--color-ink);
  border-color: var(--color-ink);
  color: var(--color-surface);
}
/* El radio o la casilla no se ve, pero sigue funcionando y recibiendo el foco. */
.chip__input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  margin: 0;
}
.chip:has(.chip__input:focus-visible) {
  outline: 3px solid var(--color-ink);
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  .chip {
    transition: none;
  }
}
</style>
