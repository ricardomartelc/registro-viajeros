<script setup lang="ts">
import { computed, useId } from 'vue'
import AppIcon from './AppIcon.vue'
import { t } from '../../i18n'

// Casilla nativa con etiqueta visible. Toda la fila (44 px o más) se puede pulsar.
// - hint: texto de ayuda debajo.
// - error: texto del error (con icono y texto, no solo color).
// - id: opcional, para poder llevar el foco a la casilla.
const props = defineProps<{ label: string; hint?: string; error?: string; id?: string }>()
const model = defineModel<boolean>({ default: false })

const generatedId = useId()
const id = props.id ?? generatedId
const hintId = `${id}-ayuda`
const errorId = `${id}-error`
const describedBy = computed(() => {
  const ids = []
  if (props.hint) ids.push(hintId)
  if (props.error) ids.push(errorId)
  return ids.length ? ids.join(' ') : undefined
})
</script>

<template>
  <div class="check" :class="{ 'check--error': error }">
    <p v-if="error" :id="errorId" class="check__error">
      <AppIcon name="alert" />
      <span><span class="visually-hidden">{{ t('field.errorPrefix') }}</span> {{ error }}</span>
    </p>
    <input
      :id="id"
      v-model="model"
      type="checkbox"
      class="check__input"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="describedBy"
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
.check__error {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0 0 var(--space-2);
  color: var(--color-error);
  font-weight: 600;
}
.check__input {
  width: var(--space-5);
  height: var(--space-5);
  margin: 0;
  accent-color: var(--color-ink);
}
.check--error .check__input {
  outline: 2px solid var(--color-error);
  outline-offset: 2px;
}
/* Con error, el foco sigue viéndose (más grueso y en tinta) */
.check--error .check__input:focus-visible {
  outline: 3px solid var(--color-ink);
}
.check__label {
  display: flex;
  align-items: center;
  min-height: var(--tap-min);
  padding: var(--space-1) 0;
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
