<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import AppButton from '../shared/AppButton.vue'
import AppIcon from '../shared/AppIcon.vue'
import CheckboxField from '../shared/CheckboxField.vue'
import ErrorSummary from '../shared/ErrorSummary.vue'
import SummaryCard from '../shared/SummaryCard.vue'
import { focusField } from '../shared/focusField'
import GuestLayout from './GuestLayout.vue'
import { applySharedData, booking, confirmed, localToday, reviewNav } from './bookingState'
import {
  blockHasErrors,
  companionTitle,
  holderTitle,
  personRows,
  reviewErrors,
  stayRows,
  stayTitle,
  type EditTarget,
} from './review'
import { t } from '../../i18n'

// Pantalla Revisar (patrón "Comprueba tus respuestas" de GOV.UK):
// una tarjeta por bloque con botón "Cambiar", la lista de errores con enlaces,
// la casilla de confirmación y "Continuar".
const emit = defineEmits<{ back: []; edit: [target: EditTarget]; next: [] }>()

// Antes de revisar (y antes de calcular nada), se copian otra vez el domicilio y el
// contacto del titular a los acompañantes con la casilla marcada (por si el titular los cambió).
applySharedData()

const today = localToday()
const errors = computed(() => reviewErrors(today))
const hasErrors = computed(() => errors.value.length > 0)

// Ir a una pantalla para corregir. Con un error, además se lleva el foco a su campo.
// En las dos, "Siguiente" en esa pantalla volverá directamente aquí.
function edit(target: EditTarget, goToField: boolean): void {
  reviewNav.returnToReview = true
  reviewNav.focusField = goToField ? (target.fieldId ?? null) : null
  emit('edit', target)
}

const summaryItems = computed(() =>
  errors.value.map((error) => ({
    id: error.target.fieldId ?? '',
    label: error.label,
    text: error.text,
    action: () => edit(error.target, true),
  })),
)

// Bloques: estancia, titular y cada acompañante
const companions = computed(() => booking.people.map((_, index) => index).slice(1))
const stayTarget: EditTarget = { screen: 'estancia' }
const holderTarget: EditTarget = { screen: 'datos' }
const companionTarget = (index: number): EditTarget => ({
  screen: 'acompanantes',
  companion: index,
})

// Casilla obligatoria y "Continuar"
const accepted = ref(false)
const acceptError = ref(false)

async function submit(): Promise<void> {
  if (hasErrors.value) return
  if (!accepted.value) {
    acceptError.value = true
    await nextTick()
    focusField('confirmar-datos')
    return
  }
  confirmed.value = true
  emit('next')
}

function onAcceptChange(value: boolean): void {
  accepted.value = value
  if (value) acceptError.value = false
}
</script>

<template>
  <GuestLayout :step="3" :title="t('review.title')" :intro="t('review.intro')">
    <ErrorSummary :items="summaryItems" />

    <div class="blocks">
      <!-- Estancia -->
      <div class="block">
        <p v-if="blockHasErrors(errors, stayTarget)" class="block__error">
          <AppIcon name="alert" /> {{ t('review.blockHasErrors') }}
        </p>
        <SummaryCard
          :class="{ 'card--error': blockHasErrors(errors, stayTarget) }"
          :title="stayTitle()"
          :rows="stayRows()"
        >
          <template #action>
            <AppButton variant="outline" class="change" @click="edit(stayTarget, false)">
              {{ t('review.change') }}
              <span class="visually-hidden">{{ t('review.changeStay') }}</span>
            </AppButton>
          </template>
        </SummaryCard>
      </div>

      <!-- Titular -->
      <div class="block">
        <p v-if="blockHasErrors(errors, holderTarget)" class="block__error">
          <AppIcon name="alert" /> {{ t('review.blockHasErrors') }}
        </p>
        <SummaryCard
          :class="{ 'card--error': blockHasErrors(errors, holderTarget) }"
          :title="holderTitle()"
          :rows="personRows(0, today)"
        >
          <template #action>
            <AppButton variant="outline" class="change" @click="edit(holderTarget, false)">
              {{ t('review.change') }}
              <span class="visually-hidden">{{ t('review.changeHolder') }}</span>
            </AppButton>
          </template>
        </SummaryCard>
      </div>

      <!-- Acompañantes -->
      <div v-for="index in companions" :key="index" class="block">
        <p v-if="blockHasErrors(errors, companionTarget(index))" class="block__error">
          <AppIcon name="alert" /> {{ t('review.blockHasErrors') }}
        </p>
        <SummaryCard
          :class="{ 'card--error': blockHasErrors(errors, companionTarget(index)) }"
          :title="companionTitle(index)"
          :rows="personRows(index, today)"
        >
          <template #action>
            <AppButton variant="outline" class="change" @click="edit(companionTarget(index), false)">
              {{ t('review.change') }}
              <span class="visually-hidden">
                {{ t('review.changeCompanion').replace('{n}', String(index + 1)) }}
              </span>
            </AppButton>
          </template>
        </SummaryCard>
      </div>
    </div>

    <form novalidate class="confirm" @submit.prevent="submit">
      <CheckboxField
        id="confirmar-datos"
        :model-value="accepted"
        :label="t('review.confirm')"
        :error="acceptError ? t('review.confirmRequired') : undefined"
        @update:model-value="onAcceptChange"
      />

      <!-- Con errores: el botón no funciona y se explica por qué (no solo con el color) -->
      <p v-if="hasErrors" id="motivo-continuar" class="confirm__reason">
        <AppIcon name="alert" />
        <span>{{ t('review.fixErrors') }}</span>
      </p>

      <div class="actions">
        <AppButton
          type="submit"
          class="actions__button"
          :disabled="hasErrors"
          :aria-describedby="hasErrors ? 'motivo-continuar' : undefined"
        >
          {{ t('review.continue') }}
        </AppButton>
        <AppButton variant="outline" class="actions__button" @click="emit('back')">
          {{ t('nav.back') }}
        </AppButton>
      </div>
    </form>
  </GuestLayout>
</template>

<style scoped>
.blocks {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.block {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.block__error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  color: var(--color-error);
  font-weight: 600;
}
/* Tarjeta con errores: borde rojo (además del texto de arriba) */
.card--error {
  border: 2px solid var(--color-error);
}
/* Botón "Cambiar": de contorno, más pequeño que los principales pero de 44 px */
.change {
  flex-shrink: 0;
  min-height: var(--tap-min);
  padding: 0 var(--space-4);
  font-size: var(--text-base);
}
.confirm {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding-top: var(--space-2);
}
.confirm__reason {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-error);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  color: var(--color-error);
  font-weight: 600;
}
.actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.actions__button {
  width: 100%;
}
</style>
