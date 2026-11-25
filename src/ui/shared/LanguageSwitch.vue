<script setup lang="ts">
import { LOCALES, LOCALE_NAMES, locale, setLocale, t } from '../../i18n'

// Selector de idioma de cristal. Solo se usa sobre fotos (ver docs/estilo.md).
</script>

<template>
  <div class="lang" role="group" :aria-label="t('lang.label')">
    <button
      v-for="code in LOCALES"
      :key="code"
      type="button"
      class="lang__btn"
      :class="{ 'lang__btn--on': code === locale }"
      :aria-pressed="code === locale"
      :lang="code"
      :title="LOCALE_NAMES[code]"
      @click="setLocale(code)"
    >
      {{ code.toUpperCase() }}
    </button>
  </div>
</template>

<style scoped>
.lang {
  display: flex;
  padding: var(--space-1);
  border-radius: var(--radius-pill);
  border: 1px solid var(--glass-border);
  background: var(--glass-bg-dark);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
}
.lang__btn {
  min-width: var(--tap-min);
  min-height: var(--tap-min);
  border: 0;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--color-on-photo);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 200ms var(--ease);
}
.lang__btn--on {
  background: var(--color-surface);
  color: var(--color-ink);
}
/* Sobre la foto, el contorno de foco va en blanco para que se vea. */
.lang__btn:focus-visible {
  outline-color: var(--color-on-photo);
}
@media (prefers-reduced-motion: reduce) {
  .lang__btn {
    transition: none;
  }
}
</style>
