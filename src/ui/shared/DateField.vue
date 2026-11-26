<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { t } from '../../i18n'

// Fecha en tres campos (día, mes, año) con teclado numérico. v-model: 'AAAA-MM-DD'.
// - Día y mes de una cifra se completan con un cero: 7 → 07.
// - Si está a medias, se devuelve tal cual (p. ej. '2027-07-') y el dominio dirá 'fecha.formato'.
// - Emite 'leave' solo cuando el foco sale de los tres campos, no al pasar de uno a otro.
const props = defineProps<{
  id: string
  legend: string
  hint?: string
  error?: string
  birthday?: boolean // true: autocomplete de fecha de nacimiento (bday-day, bday-month, bday-year)
}>()
const emit = defineEmits<{ leave: [] }>()
const model = defineModel<string>({ default: '' })

const day = ref('')
const month = ref('')
const year = ref('')

function compose(): string {
  if (!day.value && !month.value && !year.value) return ''
  const pad = (text: string) => (text.length === 1 ? `0${text}` : text)
  return `${year.value}-${pad(month.value)}-${pad(day.value)}`
}

// Reparte el valor guardado en los tres campos (al cargar o al borrar los datos).
function split(value: string): void {
  const [y = '', m = '', d = ''] = value.split('-')
  year.value = y
  month.value = m
  day.value = d
}
split(model.value)
watch(model, (value) => {
  if (value !== compose()) split(value)
})
watch([day, month, year], () => {
  model.value = compose()
})

const root = ref<HTMLElement>()
function onFocusOut(event: FocusEvent): void {
  const next = event.relatedTarget as Node | null
  if (!next || !root.value?.contains(next)) emit('leave')
}

const hintId = `${props.id}-ayuda`
const errorId = `${props.id}-error`
const describedBy = computed(() => {
  const ids = []
  if (props.hint) ids.push(hintId)
  if (props.error) ids.push(errorId)
  return ids.length ? ids.join(' ') : undefined
})
const autocomplete = (part: 'day' | 'month' | 'year') => (props.birthday ? `bday-${part}` : 'off')
</script>

<template>
  <fieldset
    :id="id"
    ref="root"
    class="date"
    :class="{ 'date--error': error }"
    :aria-describedby="describedBy"
    @focusout="onFocusOut"
  >
    <legend class="date__legend">{{ legend }}</legend>
    <p v-if="hint" :id="hintId" class="date__hint">{{ hint }}</p>
    <p v-if="error" :id="errorId" class="date__error">
      <AppIcon name="alert" />
      <span><span class="visually-hidden">{{ t('field.errorPrefix') }}</span> {{ error }}</span>
    </p>
    <div class="date__parts">
      <div class="date__part">
        <label :for="`${id}-dia`" class="date__label">{{ t('date.day') }}</label>
        <input
          :id="`${id}-dia`"
          v-model="day"
          class="date__input date__input--short"
          inputmode="numeric"
          maxlength="2"
          enterkeyhint="next"
          :autocomplete="autocomplete('day')"
          :aria-invalid="error ? 'true' : undefined"
        />
      </div>
      <div class="date__part">
        <label :for="`${id}-mes`" class="date__label">{{ t('date.month') }}</label>
        <input
          :id="`${id}-mes`"
          v-model="month"
          class="date__input date__input--short"
          inputmode="numeric"
          maxlength="2"
          enterkeyhint="next"
          :autocomplete="autocomplete('month')"
          :aria-invalid="error ? 'true' : undefined"
        />
      </div>
      <div class="date__part">
        <label :for="`${id}-anio`" class="date__label">{{ t('date.year') }}</label>
        <input
          :id="`${id}-anio`"
          v-model="year"
          class="date__input date__input--long"
          inputmode="numeric"
          maxlength="4"
          enterkeyhint="next"
          :autocomplete="autocomplete('year')"
          :aria-invalid="error ? 'true' : undefined"
        />
      </div>
    </div>
  </fieldset>
</template>

<style scoped>
.date {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
.date__legend {
  padding: 0;
  font-weight: 600;
}
.date__hint {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-muted);
}
.date__error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  color: var(--color-error);
  font-weight: 600;
}
.date__parts {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-1);
}
.date__part {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.date__label {
  font-size: var(--text-sm);
  color: var(--color-muted);
}
.date__input {
  min-height: var(--tap-min);
  padding: 0 var(--space-3);
  border: 1px solid var(--color-field-border);
  border-radius: var(--radius-field);
  background: var(--color-surface);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: var(--text-base); /* 16 px o más */
  text-align: center;
}
/* Ancho según las cifras que caben: 2 para día y mes, 4 para el año */
.date__input--short {
  width: calc(var(--space-7) + var(--space-4));
}
.date__input--long {
  width: calc(var(--space-7) * 2);
}
.date--error .date__input {
  border: 2px solid var(--color-error);
}
</style>
