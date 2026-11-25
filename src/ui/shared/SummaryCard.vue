<script setup lang="ts">
import type { SummaryRow } from './types'

// Tarjeta de resumen con filas alternas (blanco y marfil), para la pantalla Revisar.
defineProps<{ title: string; rows: SummaryRow[] }>()
</script>

<template>
  <section class="summary">
    <h2 class="summary__title">{{ title }}</h2>
    <dl class="summary__list">
      <div v-for="row in rows" :key="row.label" class="summary__row">
        <dt class="summary__label">{{ row.label }}</dt>
        <dd class="summary__value">{{ row.value }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.summary {
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
}
.summary__title {
  margin-bottom: var(--space-3);
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: 600;
}
.summary__list {
  margin: 0;
}
.summary__row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  min-height: var(--tap-min);
  align-items: center;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-field);
}
/* Filas alternas: una de cada dos en marfil */
.summary__row:nth-child(even) {
  background: var(--color-paper);
}
.summary__label {
  color: var(--color-muted);
}
.summary__value {
  margin: 0;
  font-weight: 600;
  text-align: right;
  overflow-wrap: anywhere;
}
</style>
