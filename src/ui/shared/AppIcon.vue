<script setup lang="ts">
import { icons, type IconName } from './icons'

// Icono decorativo: los lectores de pantalla lo ignoran (aria-hidden).
// Su tamaño sigue al tamaño de letra del elemento que lo contiene (1em).
defineProps<{ name: IconName }>()
</script>

<template>
  <svg
    class="icon"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path v-for="d in icons[name]" :key="d" :d="d" />
  </svg>
</template>

<style scoped>
.icon {
  display: block;
  flex-shrink: 0;
}
</style>
