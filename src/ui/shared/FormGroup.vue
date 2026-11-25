<script setup lang="ts">
// Grupo de filas tipo lista agrupada de iOS: una tarjeta blanca con filas
// (FormRow) separadas por líneas finas. Título y nota al pie opcionales.
defineProps<{ title?: string; note?: string }>()
</script>

<template>
  <section class="group">
    <h2 v-if="title" class="group__title">{{ title }}</h2>
    <div class="group__card">
      <slot />
    </div>
    <p v-if="note" class="group__note">{{ note }}</p>
  </section>
</template>

<style scoped>
.group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.group__title {
  padding: 0 var(--space-4);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-muted);
}
.group__card {
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
}
.group__note {
  margin: 0;
  padding: 0 var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-muted);
}
</style>
