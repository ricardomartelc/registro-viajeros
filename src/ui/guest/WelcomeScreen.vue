<script setup lang="ts">
import AppButton from '../shared/AppButton.vue'
import AppIcon from '../shared/AppIcon.vue'
import LanguageSwitch from '../shared/LanguageSwitch.vue'
import type { IconName } from '../shared/icons'
import { t, type MessageKey } from '../../i18n'
import fotoCasa from '../../assets/photos/plano-general-casa.jpg'

// "Comenzar" avisa a App.vue, que cambia a la pantalla Estancia.
const emit = defineEmits<{ start: [] }>()

// Los tres pasos de "Cómo funciona": icono, título y texto (claves de i18n).
const steps: { icon: IconName; title: MessageKey; text: MessageKey }[] = [
  { icon: 'edit', title: 'welcome.step1.title', text: 'welcome.step1.text' },
  { icon: 'download', title: 'welcome.step2.title', text: 'welcome.step2.text' },
  { icon: 'mail', title: 'welcome.step3.title', text: 'welcome.step3.text' },
]
</script>

<template>
  <main class="welcome">
    <!-- Primera pantalla: foto a pantalla completa. Texto arriba (sobre el cielo), botón abajo. -->
    <section class="hero" aria-labelledby="welcome-title">
      <img class="hero__photo" :src="fotoCasa" :alt="t('welcome.photoAlt')" />
      <!-- Velo muy suave arriba: solo asegura el contraste del texto sobre el cielo -->
      <div class="hero__veil" aria-hidden="true"></div>

      <div class="hero__top">
        <header class="hero__bar">
          <!-- aria-hidden: el nombre ya lo lee el título h1 de abajo -->
          <span class="hero__brand" aria-hidden="true">{{ t('brand') }}</span>
          <LanguageSwitch />
        </header>
        <div class="hero__heading">
          <h1 id="welcome-title" class="hero__title" tabindex="-1">{{ t('brand') }}</h1>
          <p class="hero__place">{{ t('welcome.place') }}</p>
        </div>
      </div>

      <div class="hero__bottom">
        <AppButton variant="glass-accent" @click="emit('start')">
          {{ t('welcome.start') }}
          <AppIcon name="arrow" />
        </AppButton>
      </div>
    </section>

    <!-- Debajo de la foto: se ve al bajar -->
    <section class="how" aria-labelledby="how-title">
      <p v-reveal class="how__lead">{{ t('welcome.lead') }}</p>
      <h2 id="how-title" v-reveal="80" class="how__title">{{ t('welcome.howTitle') }}</h2>

      <ol class="how__list">
        <li
          v-for="(step, i) in steps"
          :key="step.icon"
          v-reveal="80 * (i + 2)"
          class="how__step"
        >
          <span class="how__icon"><AppIcon :name="step.icon" /></span>
          <div>
            <h3 class="how__step-title">{{ t(step.title) }}</h3>
            <p class="how__step-text">{{ t(step.text) }}</p>
          </div>
        </li>
      </ol>

      <p v-reveal="400" class="how__privacy">
        {{ t('welcome.privacy') }}
        <a href="#aviso">{{ t('welcome.privacyLink') }}</a>
      </p>

      <!-- Secundario (contorno): en móviles altos se vería a la vez que el rojo de la foto,
           y solo puede haber un botón rojo visible a la vez (docs/estilo.md). -->
      <div v-reveal="480">
        <AppButton variant="outline" class="how__cta" @click="emit('start')">
          {{ t('welcome.start') }}
        </AppButton>
      </div>
    </section>
  </main>
</template>

<style scoped>
.welcome {
  max-width: var(--layout-max-width);
  margin: 0 auto;
  background: var(--color-paper);
}

/* ---------- Primera pantalla ---------- */
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100dvh;
  overflow: hidden;
  color: var(--color-on-photo);
}
.hero__photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: var(--photo-welcome-position);
}

/* Velo muy suave: va de --overlay-sky (arriba) a transparente */
.hero__veil {
  position: absolute;
  inset: 0 0 auto 0;
  height: var(--overlay-sky-height);
  background: linear-gradient(var(--overlay-sky), transparent);
}

/* Parte de arriba, sobre el cielo: barra, título y pastilla */
.hero__top {
  position: relative;
}
.hero__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(var(--space-3) + env(safe-area-inset-top)) var(--space-4) 0;
}
.hero__brand {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  letter-spacing: 0.02em;
}
.hero__heading {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5) 0;
}
.hero__title:focus {
  outline: none; /* el foco del título es solo para lectores de pantalla */
}
.hero__title {
  width: min-content; /* una palabra por línea: "Can" / "Vauma" */
  font-size: var(--text-display);
  line-height: 0.95;
}
.hero__place {
  margin: 0;
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-pill);
  background: var(--glass-bg-dark);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: 0.04em;
}

/* Parte de abajo, sobre el seto: solo el botón principal, centrado */
.hero__bottom {
  position: relative;
  display: flex;
  justify-content: center;
  padding: 0 var(--space-5) calc(var(--space-6) + env(safe-area-inset-bottom));
}

/* ---------- Debajo de la foto ---------- */
.how {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-7) var(--space-5);
}
.how__lead {
  margin: 0;
  font-size: var(--text-lg);
}
.how__title {
  font-size: var(--text-title);
}
/* Lista agrupada tipo iOS: una tarjeta con filas separadas por líneas finas */
.how__list {
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
}
.how__step {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-4);
}
.how__step + .how__step {
  border-top: 1px solid var(--color-line);
}
.how__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--space-7);
  height: var(--space-7);
  border-radius: var(--radius-pill);
  background: var(--color-paper);
  color: var(--color-ink);
  font-size: var(--text-lg);
}
.how__step-title {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: 600;
  line-height: 1.3;
}
.how__step-text {
  margin: var(--space-1) 0 0;
  color: var(--color-muted);
}
.how__privacy {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-muted);
}
.how__cta {
  width: 100%;
}
</style>
