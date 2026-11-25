<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import type { IconName } from './icons'
import { t } from '../../i18n'

// Indicador de pasos: iconos en círculo unidos por una línea.
// - steps: lista de pasos (icono y texto). El texto no se ve, pero lo leen los lectores de pantalla.
// - current: posición del paso actual, empezando en 0.
// Los pasos hechos y el actual van en tinta; los siguientes, en gris claro.
defineProps<{
  steps: { icon: IconName; label: string }[]
  current: number
}>()
</script>

<template>
  <ol class="steps" :aria-label="t('steps.label')">
    <li
      v-for="(step, i) in steps"
      :key="step.label"
      class="steps__item"
      :class="{ 'steps__item--reached': i <= current }"
      :aria-current="i === current ? 'step' : undefined"
    >
      <span class="steps__dot">
        <AppIcon :name="step.icon" />
      </span>
      <span class="visually-hidden">{{ step.label }}</span>
    </li>
  </ol>
</template>

<style scoped>
.steps {
  display: flex;
  align-items: center;
  margin: 0;
  padding: var(--space-2);
  list-style: none;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
}
.steps__item {
  display: flex;
  align-items: center;
}
/* Todos los pasos menos el primero ocupan el espacio libre y dibujan la línea a su izquierda. */
.steps__item + .steps__item {
  flex: 1;
}
.steps__item + .steps__item::before {
  content: '';
  flex: 1;
  height: 2px;
  background: var(--color-line);
}
.steps__item + .steps__item--reached::before {
  background: var(--color-ink);
}
.steps__dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--space-6);
  height: var(--space-6);
  border-radius: var(--radius-pill);
  background: var(--color-paper);
  color: var(--color-muted);
  font-size: var(--text-base);
}
.steps__item--reached .steps__dot {
  background: var(--color-ink);
  color: var(--color-surface);
}
</style>
