<script setup lang="ts">
// variant: 'primary' (rojo, acción principal), 'glass' (cristal, solo sobre fotos), 'outline' (borde)
withDefaults(defineProps<{ variant?: 'primary' | 'glass' | 'outline'; href?: string }>(), {
  variant: 'primary',
  href: undefined,
})
</script>

<template>
  <component :is="href ? 'a' : 'button'" :href="href" class="btn" :class="`btn--${variant}`">
    <slot />
  </component>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 0 var(--space-5);
  border: 1px solid transparent;
  border-radius: var(--radius-button);
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 200ms var(--ease),
    transform 120ms var(--ease);
}
.btn:active {
  transform: scale(0.98);
}
.btn--primary {
  background: var(--color-accent);
  color: var(--color-on-accent);
}
.btn--primary:hover {
  background: var(--color-accent-hover);
}
.btn--outline {
  background: transparent;
  color: var(--color-ink);
  border-color: var(--color-ink);
}
.btn--glass {
  background: var(--glass-bg);
  color: #fff;
  border-color: var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
}
</style>
