<script setup lang="ts">
import { defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import WelcomeScreen from './ui/guest/WelcomeScreen.vue'
import StayScreen from './ui/guest/StayScreen.vue'
import HolderScreen from './ui/guest/HolderScreen.vue'
import CompanionScreen from './ui/guest/CompanionScreen.vue'
import { booking, clampCompanion, ensurePeopleCount } from './ui/guest/bookingState'

// Página de muestra de piezas: solo en desarrollo y con ?muestra=1 en la URL.
// En producción import.meta.env.DEV vale false y Vite deja la página fuera del paquete.
const showcase =
  import.meta.env.DEV && new URLSearchParams(window.location.search).has('muestra')
    ? defineAsyncComponent(() => import('./ui/dev/ShowcaseScreen.vue'))
    : null

// Pantalla actual. Se guarda también en la dirección (#estancia, #datos...) para que
// el botón "atrás" del móvil vuelva a la pantalla anterior en vez de salir de la web.
type Screen = 'bienvenida' | 'estancia' | 'datos' | 'acompanantes'
const SCREENS: Screen[] = ['bienvenida', 'estancia', 'datos', 'acompanantes']

function screenFromAddress(): Screen {
  const name = window.location.hash.slice(1) as Screen
  return SCREENS.includes(name) ? name : 'bienvenida'
}

const screen = ref<Screen>(screenFromAddress())

// Acompañante que se está rellenando (1 = primer acompañante). Va en history.state,
// así el "atrás" del móvil pasa de un acompañante al anterior con la misma dirección.
const companion = ref<number>(history.state?.companion ?? 1)

// Si se entra en #acompanantes sin acompañantes, se va a Datos;
// si el número de acompañante ya no existe, se corrige al último que exista.
function checkCompanions(): void {
  if (screen.value !== 'acompanantes') return
  ensurePeopleCount()
  if (booking.people.length < 2) {
    screen.value = 'datos'
    history.replaceState(null, '', '#datos')
  } else {
    companion.value = clampCompanion(companion.value)
  }
}
checkCompanions()

// Tras cambiar de pantalla: arriba del todo y foco en el título (h1, con tabindex="-1"),
// para que el lector de pantalla anuncie la pantalla nueva.
async function showTop(): Promise<void> {
  await nextTick()
  window.scrollTo(0, 0)
  document.querySelector<HTMLElement>('h1')?.focus()
}

// companionIndex solo cuenta en 'acompanantes'. Protección: nunca pasa del último que exista.
function goTo(next: Screen, companionIndex = 1): void {
  screen.value = next
  companion.value = clampCompanion(companionIndex)
  const address =
    next === 'bienvenida' ? window.location.pathname + window.location.search : `#${next}`
  history.pushState(next === 'acompanantes' ? { companion: companion.value } : null, '', address)
  void showTop()
}

// Botones atrás y adelante del navegador
function onPopState(event: PopStateEvent): void {
  screen.value = screenFromAddress()
  companion.value = event.state?.companion ?? 1
  checkCompanions()
  void showTop()
}
onMounted(() => window.addEventListener('popstate', onPopState))
onBeforeUnmount(() => window.removeEventListener('popstate', onPopState))

// "Siguiente" en Datos: a Acompañantes solo si los hay (si no, la pantalla enseña un aviso).
function afterHolder(): void {
  if (booking.people.length > 1) goTo('acompanantes', 1)
}

// "Siguiente" en un acompañante: al siguiente, si existe. Desde el último,
// CompanionScreen no avisa (enseña "revisar (en preparación)"), pero por si acaso no se navega.
function afterCompanion(): void {
  if (companion.value < booking.people.length - 1) goTo('acompanantes', companion.value + 1)
}

function beforeCompanion(): void {
  if (companion.value > 1) goTo('acompanantes', companion.value - 1)
  else goTo('datos')
}
</script>

<template>
  <component :is="showcase" v-if="showcase" />
  <WelcomeScreen v-else-if="screen === 'bienvenida'" @start="goTo('estancia')" />
  <StayScreen
    v-else-if="screen === 'estancia'"
    @back="goTo('bienvenida')"
    @next="goTo('datos')"
  />
  <HolderScreen v-else-if="screen === 'datos'" @back="goTo('estancia')" @next="afterHolder" />
  <!-- key: cada acompañante es una pantalla nueva (los errores empiezan limpios) -->
  <CompanionScreen
    v-else-if="screen === 'acompanantes'"
    :key="companion"
    :index="companion"
    @back="beforeCompanion"
    @next="afterCompanion"
  />
</template>
