<script setup lang="ts">
import { computed } from 'vue'
import StepIndicator from '../shared/StepIndicator.vue'
import DraftNotice from './DraftNotice.vue'
import { t } from '../../i18n'

// Marco común de las pantallas del formulario: pasos, título, introducción,
// aviso de guardado y el contenido de cada pantalla.
// El título lleva tabindex="-1": App.vue le pasa el foco al cambiar de pantalla.
const props = defineProps<{ step: number; title: string; intro?: string }>()

const steps = computed(() => [
  { icon: 'home' as const, label: t('steps.stay') },
  { icon: 'user' as const, label: t('steps.holder') },
  { icon: 'users' as const, label: t('steps.companions') },
  { icon: 'check' as const, label: t('steps.review') },
])

// Texto "Paso 1 de 4" para lectores de pantalla y vista
const stepText = computed(() =>
  t('steps.position')
    .replace('{actual}', String(props.step + 1))
    .replace('{total}', String(steps.value.length)),
)
</script>

<template>
  <main class="screen">
    <StepIndicator :steps="steps" :current="step" />
    <p class="screen__step">{{ stepText }}</p>
    <h1 tabindex="-1" class="screen__title">{{ title }}</h1>
    <p v-if="intro" class="screen__intro">{{ intro }}</p>
    <DraftNotice />
    <slot />
  </main>
</template>

<style scoped>
.screen {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: var(--layout-max-width);
  min-height: 100dvh;
  margin: 0 auto;
  padding: calc(var(--space-4) + env(safe-area-inset-top)) var(--space-4)
    calc(var(--space-7) + env(safe-area-inset-bottom));
}
.screen__step {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-muted);
}
.screen__title {
  font-size: var(--text-title);
}
.screen__title:focus {
  outline: none; /* el foco del título es solo para lectores de pantalla */
}
.screen__intro {
  margin: 0;
}
</style>
