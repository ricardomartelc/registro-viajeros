<script setup lang="ts">
import { computed, useId } from 'vue'
import AppIcon from './AppIcon.vue'
import { t } from '../../i18n'

// Campo de texto con etiqueta visible, ayuda y error (con icono y texto, no solo color).
// - autocomplete: ayuda al móvil a rellenar (p. ej. 'given-name', 'email').
// - inputmode: qué teclado sale en el móvil (p. ej. 'numeric', 'email').
// - enterkeyhint: qué pone la tecla Intro del teclado (p. ej. 'next', 'done').
const props = withDefaults(
  defineProps<{
    label: string
    id?: string // para enlazar desde el resumen de errores; si no se da, se genera uno
    hint?: string
    error?: string
    optional?: boolean
    type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'time' | 'search'
    autocomplete?: string
    inputmode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'
    enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'
  }>(),
  { type: 'text' },
)

const model = defineModel<string>({ default: '' })

const generatedId = useId()
const id = props.id ?? generatedId
const hintId = `${id}-ayuda`
const errorId = `${id}-error`

// El lector de pantalla lee la ayuda y el error al entrar en el campo.
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
    <input
      :id="id"
      v-model="model"
      class="field__input"
      :type="type"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :enterkeyhint="enterkeyhint"
      :required="!optional"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="describedBy"
    />
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
.field__input {
  width: 100%;
  min-height: var(--tap-min);
  margin-top: var(--space-1);
  padding: 0 var(--space-3);
  border: 1px solid var(--color-field-border);
  border-radius: var(--radius-field);
  background: var(--color-surface);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: var(--text-base); /* 16 px o más: así el iPhone no hace zoom al tocar */
}
/* Con error: borde más grueso en rojo (el texto de error ya lo explica) */
.field--error .field__input {
  border: 2px solid var(--color-error);
}
</style>
