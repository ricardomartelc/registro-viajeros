<script setup lang="ts">
// Una fila dentro de FormGroup. Con label: etiqueta a la izquierda y contenido
// a la derecha (p. ej. un dato). Sin label: el contenido ocupa toda la fila
// (p. ej. un TextField, que ya trae su propia etiqueta).
defineProps<{ label?: string }>()
</script>

<template>
  <div class="row">
    <span v-if="label" class="row__label">{{ label }}</span>
    <div class="row__content" :class="{ 'row__content--full': !label }">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  min-height: var(--tap-min);
  padding: var(--space-3) var(--space-4);
}
/* Línea fina entre filas (no encima de la primera) */
.row + .row {
  border-top: 1px solid var(--color-line);
}
.row__label {
  color: var(--color-muted);
}
.row__content {
  text-align: right;
}
.row__content--full {
  flex: 1;
  text-align: left;
}
</style>
