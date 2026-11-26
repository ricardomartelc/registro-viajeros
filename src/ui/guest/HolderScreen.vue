<script setup lang="ts">
import { nextTick, ref } from 'vue'
import AppButton from '../shared/AppButton.vue'
import ErrorSummary from '../shared/ErrorSummary.vue'
import GuestLayout from './GuestLayout.vue'
import PersonFields from './PersonFields.vue'
import { usePersonForm } from './usePersonForm'
import { booking, ensurePeopleCount } from './bookingState'
import { t } from '../../i18n'

// Pantalla Datos del titular: la primera persona de la reserva.
// El formulario está en PersonFields.vue y su lógica en usePersonForm.ts (los comparte con
// la pantalla de acompañantes).
const emit = defineEmits<{ back: []; next: [] }>()
const form = usePersonForm(0)

const summary = ref<InstanceType<typeof ErrorSummary>>()
// Si no hay acompañantes, el siguiente paso (Revisar) aún no existe: se enseña un aviso.
const reviewPending = ref(false)

async function submit(): Promise<void> {
  form.clean()
  form.submitted.value = true
  if (form.errors.value.length > 0) {
    reviewPending.value = false
    await nextTick()
    summary.value?.focus()
    return
  }
  ensurePeopleCount()
  reviewPending.value = booking.people.length <= 1
  emit('next') // App.vue decide: Acompañantes, o nada si no hay
}
</script>

<template>
  <GuestLayout :step="1" :title="t('holder.title')" :intro="t('holder.intro')">
    <ErrorSummary ref="summary" :items="form.summaryList.value" />

    <form novalidate class="form" @submit.prevent="submit">
      <PersonFields :form="form" />

      <!-- role="status": el lector de pantalla lo anuncia sin mover el foco -->
      <p role="status" class="pending">{{ reviewPending ? t('review.pending') : '' }}</p>

      <div class="actions">
        <AppButton type="submit" class="actions__button">{{ t('nav.next') }}</AppButton>
        <AppButton variant="outline" class="actions__button" @click="emit('back')">
          {{ t('nav.back') }}
        </AppButton>
      </div>
    </form>
  </GuestLayout>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.pending {
  margin: 0;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  background: var(--color-surface);
}
.pending:empty {
  display: none;
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
