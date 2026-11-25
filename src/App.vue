<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import WelcomeScreen from './ui/guest/WelcomeScreen.vue'

// Página de muestra de piezas: solo en desarrollo y con ?muestra=1 en la URL.
// En producción import.meta.env.DEV vale false y Vite deja la página fuera del paquete.
const showcase =
  import.meta.env.DEV && new URLSearchParams(window.location.search).has('muestra')
    ? defineAsyncComponent(() => import('./ui/dev/ShowcaseScreen.vue'))
    : null
</script>

<template>
  <component :is="showcase" v-if="showcase" />
  <WelcomeScreen v-else />
</template>
