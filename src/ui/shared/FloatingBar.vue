<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import type { Option } from './types'

// Barra flotante en píldora con iconos, fija abajo y centrada.
// - label: nombre de la barra para lectores de pantalla.
// - items: un botón por opción (icono + texto, el texto lo leen los lectores de pantalla).
// - v-model: la opción activa.
// La página que la use debe dejar abajo un hueco de --floating-bar-height para no tapar nada.
defineProps<{ label: string; items: Option[] }>()
const model = defineModel<string>({ required: true })
</script>

<template>
  <nav class="bar" :aria-label="label">
    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      class="bar__btn"
      :class="{ 'bar__btn--on': item.value === model }"
      :aria-label="item.label"
      :aria-current="item.value === model ? 'page' : undefined"
      @click="model = item.value"
    >
      <AppIcon v-if="item.icon" :name="item.icon" />
    </button>
  </nav>
</template>

<style scoped>
.bar {
  position: fixed;
  left: 50%;
  bottom: calc(var(--space-4) + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  height: var(--floating-bar-height);
  padding: 0 var(--space-2);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  background: var(--glass-light-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--shadow-soft);
}
/* Navegadores sin cristal: fondo sólido casi opaco */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .bar {
    background: var(--glass-light-bg-solid);
  }
}
.bar__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--tap-min);
  height: var(--tap-min);
  border: 0;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--color-muted);
  font-size: var(--text-lg); /* tamaño del icono */
  cursor: pointer;
  transition: background-color 150ms var(--ease);
}
/* Activa: fondo marfil y tinta (además del color, cambia el fondo) */
.bar__btn--on {
  background: var(--color-paper);
  color: var(--color-ink);
}
@media (prefers-reduced-motion: reduce) {
  .bar__btn {
    transition: none;
  }
}
</style>
