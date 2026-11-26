<script setup lang="ts">
import { nextTick, ref } from 'vue'
import AppButton from '../shared/AppButton.vue'
import ErrorSummary from '../shared/ErrorSummary.vue'
import GuestLayout from './GuestLayout.vue'
import PersonFields from './PersonFields.vue'
import { usePersonForm } from './usePersonForm'
import { ensurePeopleCount } from './bookingState'
import { t } from '../../i18n'
import { FREE_NAVIGATION } from '../../config'

// Pantalla Datos del titular: la primera persona de la reserva.
// El formulario está en PersonFields.vue y su lógica en usePersonForm.ts (los comparte con
// la pantalla de acompañantes).
const emit = defineEmits<{ back: []; next: [] }>()
const form = usePersonForm(0)

const summary = ref<InstanceType<typeof ErrorSummary>>()

async function submit(): Promise<void> {
  form.clean()
  form.submitted.value = true
  // Con errores no se avanza (salvo en el modo pruebas de navegación libre, ver config.ts)
  if (form.errors.value.length > 0 && !FREE_NAVIGATION) {
    await nextTick()
    summary.value?.focus()
    return
  }
  ensurePeopleCount()
  emit('next') // App.vue decide: Acompañantes, o Revisar si va solo o viene de Revisar
}
</script>

<template>
  <GuestLayout :step="1" :title="t('holder.title')" :intro="t('holder.intro')">
    <ErrorSummary ref="summary" :items="form.summaryList.value" />

    <form novalidate class="form" @submit.prevent="submit">
      <PersonFields :form="form" />

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
.actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.actions__button {
  width: 100%;
}
</style>
