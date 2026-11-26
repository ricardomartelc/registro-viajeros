<script setup lang="ts">
import { ref } from 'vue'
import { t } from '../../i18n'

// Resumen de errores arriba del formulario (patrón GOV.UK).
// Cada error es un enlace que lleva al campo. La pantalla llama a focus() al pulsar
// "Siguiente" con errores, para que el lector de pantalla lo lea en primer lugar.
// Cada error dice de qué campo es: "Localizador de la reserva: Este dato es obligatorio."
defineProps<{ items: { id: string; label?: string; text: string }[] }>()

const box = ref<HTMLElement>()
defineExpose({ focus: () => box.value?.focus() })

// Lleva el foco al campo; si el id es de un grupo (fecha, chips), al primer control de dentro.
function goTo(id: string): void {
  const element = document.getElementById(id)
  if (!element) return
  const target = element.matches('input, select, textarea')
    ? element
    : (element.querySelector<HTMLElement>('input, select, textarea') ?? element)
  target.focus()
}
</script>

<template>
  <div
    v-if="items.length"
    ref="box"
    class="summary"
    tabindex="-1"
    aria-labelledby="resumen-errores-titulo"
  >
    <h2 id="resumen-errores-titulo" class="summary__title">{{ t('errors.title') }}</h2>
    <ul class="summary__list">
      <li v-for="item in items" :key="item.id + item.text">
        <a :href="`#${item.id}`" class="summary__link" @click.prevent="goTo(item.id)">
          <span v-if="item.label" class="summary__field">{{ item.label }}:</span>
          {{ item.text }}
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.summary {
  padding: var(--space-4);
  border: 2px solid var(--color-error);
  border-radius: var(--radius-card);
  background: var(--color-surface);
}
.summary__title {
  margin-bottom: var(--space-2);
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: 700;
}
/* Sin viñetas (como GOV.UK): cada enlace es un bloque de 44 px o más,
   y el texto largo pasa a la línea siguiente bien alineado. */
.summary__list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.summary__link {
  display: block;
  min-height: var(--tap-min);
  padding: var(--space-2) 0;
  color: var(--color-error);
}
.summary__field {
  font-weight: 700;
}
</style>
