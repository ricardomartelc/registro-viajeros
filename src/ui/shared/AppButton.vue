<script setup lang="ts">
// variant: 'primary' (rojo sólido, sobre marfil), 'glass' (cristal, solo sobre fotos),
// 'glass-accent' (píldora de cristal rojo, solo sobre fotos), 'outline' (borde)
withDefaults(
  defineProps<{ variant?: 'primary' | 'glass' | 'glass-accent' | 'outline'; href?: string }>(),
  { variant: 'primary', href: undefined },
)
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
  gap: var(--space-2);
  min-height: var(--button-height);
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
/* Hover solo en dispositivos con ratón: en pantallas táctiles se quedaría "pegado" al tocar. */
@media (hover: hover) {
  .btn--primary:hover {
    background: var(--color-accent-hover);
  }
  .btn--glass-accent:hover {
    background: var(--glass-accent-bg-hover);
  }
}
.btn--outline {
  background: transparent;
  color: var(--color-ink);
  border-color: var(--color-ink);
}
.btn--glass {
  background: var(--glass-bg);
  color: var(--color-on-photo);
  border-color: var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
}
/* El cristal solo va sobre fotos: allí el contorno de foco va en blanco para que se vea. */
.btn--glass:focus-visible {
  outline-color: var(--color-on-photo);
}
/* Píldora de cristal rojo: solo sobre fotos. Nunca a ancho completo. */
.btn--glass-accent {
  min-width: var(--button-pill-min-width);
  padding: 0 var(--space-6);
  font-size: var(--text-button-lg); /* texto grande: permite un cristal más suave */
  border-radius: var(--radius-pill);
  background: var(--glass-accent-bg);
  color: var(--color-on-photo);
  backdrop-filter: blur(var(--glass-accent-blur)) saturate(var(--glass-accent-saturate));
  -webkit-backdrop-filter: blur(var(--glass-accent-blur)) saturate(var(--glass-accent-saturate));
  box-shadow:
    inset 0 1px 0 var(--glass-highlight),
    var(--shadow-soft);
}
.btn--glass-accent:focus-visible {
  outline-color: var(--color-on-photo);
}
/* Navegadores sin cristal: rojo casi sólido para que el texto siga leyéndose. */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .btn--glass-accent {
    background: var(--glass-accent-bg-solid);
  }
}
@media (prefers-reduced-motion: reduce) {
  .btn {
    transition: none;
  }
  .btn:active {
    transform: none;
  }
}
</style>
