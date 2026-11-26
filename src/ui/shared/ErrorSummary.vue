<script setup lang="ts">
import { ref } from 'vue'
import { t } from '../../i18n'
import { focusField } from './focusField'

// Resumen de errores arriba del formulario (patrón GOV.UK).
// Cada error es un enlace que lleva al campo. La pantalla llama a focus() al pulsar
// "Siguiente" con errores, para que el lector de pantalla lo lea en primer lugar.
// Cada error dice de qué campo es: "Localizador de la reserva: Este dato es obligatorio."
// - action (opcional): qué hacer al pulsar en vez de ir al campo de esta pantalla
//   (en Revisar: abrir la pantalla donde está el campo).
export interface ErrorSummaryItem {
  id: string
  label?: string
  text: string
  action?: () => void
}
defineProps<{ items: ErrorSummaryItem[] }>()

const box = ref<HTMLElement>()
defineExpose({ focus: () => box.value?.focus() })

function select(item: ErrorSummaryItem): void {
  if (item.action) item.action()
  else focusField(item.id)
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
      <!-- key por posición: en Revisar, dos personas pueden tener el mismo campo y error -->
      <li v-for="(item, index) in items" :key="index">
        <a :href="`#${item.id}`" class="summary__link" @click.prevent="select(item)">
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
