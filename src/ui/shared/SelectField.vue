<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import { t } from '../../i18n'

// Lista desplegable nativa (<select>): en el móvil abre el selector del propio sistema.
// Misma forma que TextField: etiqueta visible, ayuda y error con icono y texto.
// La primera opción, vacía, dice "Elija una opción".
const props = defineProps<{
  id: string
  label: string
  options: { value: string; label: string }[]
  hint?: string
  error?: string
  optional?: boolean
  autocomplete?: string
}>()
const model = defineModel<string>({ default: '' })

const hintId = `${props.id}-ayuda`
const errorId = `${props.id}-error`
const describedBy = computed(() => {
  const ids = []
  if (props.hint) ids.push(hintId)
  if (props.error) ids.push(errorId)
  return ids.length ? ids.join(' ') : undefined
})
</script>

<template>
  <div class="field" :class="{ 'field--error': error }">
    <label :for="id" class="field__label">
      {{ label }}
      <span v-if="optional" class="field__optional">{{ t('field.optional') }}</span>
    </label>
    <p v-if="hint" :id="hintId" class="field__hint">{{ hint }}</p>
    <p v-if="error" :id="errorId" class="field__error">
      <AppIcon name="alert" />
      <span><span class="visually-hidden">{{ t('field.errorPrefix') }}</span> {{ error }}</span>
    </p>
    <select
      :id="id"
      v-model="model"
      class="field__select"
      :autocomplete="autocomplete"
      :required="!optional"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="describedBy"
    >
      <option value="">{{ t('select.choose') }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.field__label {
  font-weight: 600;
}
.field__optional {
  font-weight: 400;
  color: var(--color-muted);
}
.field__hint {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-muted);
}
.field__error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  color: var(--color-error);
  font-weight: 600;
}
.field__select {
  width: 100%;
  min-height: var(--tap-min);
  margin-top: var(--space-1);
  padding: 0 var(--space-3);
  border: 1px solid var(--color-field-border);
  border-radius: var(--radius-field);
  background: var(--color-surface);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: var(--text-base); /* 16 px o más: así el iPhone no hace zoom */
}
.field--error .field__select {
  border: 2px solid var(--color-error);
}
</style>
