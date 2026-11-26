<script setup lang="ts">
import { defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import WelcomeScreen from './ui/guest/WelcomeScreen.vue'
import StayScreen from './ui/guest/StayScreen.vue'
import HolderScreen from './ui/guest/HolderScreen.vue'
import CompanionScreen from './ui/guest/CompanionScreen.vue'
import ReviewScreen from './ui/guest/ReviewScreen.vue'
import FinalScreen from './ui/guest/FinalScreen.vue'
import type { EditTarget } from './ui/guest/review'
import { focusField } from './ui/shared/focusField'
import {
  applySharedData,
  booking,
  clampCompanion,
  confirmed,
  dataCleared,
  ensurePeopleCount,
  localToday,
  reviewNav,
} from './ui/guest/bookingState'
import { validateBooking, validatePerson, validateStay } from './domain/validateBooking'
import { FREE_NAVIGATION } from './config'

// Página de muestra de piezas: solo en desarrollo y con ?muestra=1 en la URL.
// En producción import.meta.env.DEV vale false y Vite deja la página fuera del paquete.
const showcase =
  import.meta.env.DEV && new URLSearchParams(window.location.search).has('muestra')
    ? defineAsyncComponent(() => import('./ui/dev/ShowcaseScreen.vue'))
    : null

// Pantalla actual. Se guarda también en la dirección (#estancia, #datos...) para que
// el botón "atrás" del móvil vuelva a la pantalla anterior en vez de salir de la web.
type Screen = 'bienvenida' | 'estancia' | 'datos' | 'acompanantes' | 'revisar' | 'final'
const SCREENS: Screen[] = ['bienvenida', 'estancia', 'datos', 'acompanantes', 'revisar', 'final']

function screenFromAddress(): Screen {
  const name = window.location.hash.slice(1) as Screen
  return SCREENS.includes(name) ? name : 'bienvenida'
}

function addressFor(name: Screen): string {
  return name === 'bienvenida' ? window.location.pathname + window.location.search : `#${name}`
}

const screen = ref<Screen>(screenFromAddress())

// Acompañante que se está rellenando (1 = primer acompañante). Va en history.state,
// así el "atrás" del móvil pasa de un acompañante al anterior con la misma dirección.
const companion = ref<number>(history.state?.companion ?? 1)

const lastCompanion = () => booking.people.length - 1

// ---------- Protección: entrar a mano en una pantalla sin los datos necesarios ----------

// Devuelve la pantalla a la que hay que ir de verdad.
// - #acompanantes sin acompañantes → Datos.
// - #revisar o #final con la estancia mal → Estancia; con el titular mal → Datos.
// - #final sin confirmar en Revisar, o con algún error → Revisar.
// En el modo pruebas de navegación libre (config.ts) solo se mantiene la primera:
// sin acompañantes no hay ninguna pantalla de acompañante que enseñar.
function allowedScreen(wanted: Screen): Screen {
  if (wanted === 'acompanantes') {
    ensurePeopleCount()
    return booking.people.length < 2 ? 'datos' : 'acompanantes'
  }
  if ((wanted === 'revisar' || wanted === 'final') && !FREE_NAVIGATION) {
    ensurePeopleCount()
    applySharedData()
    const today = localToday()
    if (validateStay(booking.stay, today).length > 0) return 'estancia'
    if (validatePerson(booking.people[0]!, 0, booking.stay.checkInDate, today).errors.length > 0) {
      return 'datos'
    }
    if (wanted === 'final' && (!confirmed.value || validateBooking(booking, today).length > 0)) {
      return 'revisar'
    }
  }
  return wanted
}

function checkScreen(): void {
  const allowed = allowedScreen(screen.value)
  if (allowed !== screen.value) {
    screen.value = allowed
    history.replaceState(null, '', addressFor(allowed))
  }
  if (screen.value === 'acompanantes') companion.value = clampCompanion(companion.value)
}
checkScreen()

// ---------- Cambiar de pantalla ----------

// Tras cambiar de pantalla: arriba del todo y foco en el título (h1, con tabindex="-1"),
// para que el lector de pantalla anuncie la pantalla nueva. Si se viene de un error de
// Revisar, el foco va al campo con el error.
async function showTop(): Promise<void> {
  await nextTick()
  window.scrollTo(0, 0)
  const field = reviewNav.focusField
  reviewNav.focusField = null
  if (field && focusField(field)) return
  document.querySelector<HTMLElement>('h1')?.focus()
}

// companionIndex solo cuenta en 'acompanantes'. Protección: nunca pasa del último que exista.
function goTo(next: Screen, companionIndex = 1): void {
  if (screen.value === 'bienvenida') dataCleared.value = false
  if (next === 'revisar') reviewNav.returnToReview = false // ya se ha vuelto
  screen.value = next
  companion.value = clampCompanion(companionIndex)
  history.pushState(next === 'acompanantes' ? { companion: companion.value } : null, '', addressFor(next))
  void showTop()
}

// Botones atrás y adelante del navegador
function onPopState(event: PopStateEvent): void {
  screen.value = screenFromAddress()
  companion.value = event.state?.companion ?? 1
  checkScreen()
  void showTop()
}
onMounted(() => window.addEventListener('popstate', onPopState))
onBeforeUnmount(() => window.removeEventListener('popstate', onPopState))

// "Atrás" en una pantalla editada desde Revisar: se abandona la vuelta directa a Revisar.
function back(next: Screen, companionIndex = 1): void {
  reviewNav.returnToReview = false
  goTo(next, companionIndex)
}

// ---------- "Siguiente" en cada pantalla ----------

function afterStay(): void {
  goTo(reviewNav.returnToReview ? 'revisar' : 'datos')
}

function afterHolder(): void {
  if (reviewNav.returnToReview || booking.people.length < 2) goTo('revisar')
  else goTo('acompanantes', 1)
}

function afterCompanion(): void {
  if (reviewNav.returnToReview || companion.value >= lastCompanion()) goTo('revisar')
  else goTo('acompanantes', companion.value + 1)
}

function beforeCompanion(): void {
  if (companion.value > 1) back('acompanantes', companion.value - 1)
  else back('datos')
}

// "Atrás" en Revisar: al último acompañante, o a Datos si va solo.
function beforeReview(): void {
  if (booking.people.length > 1) goTo('acompanantes', lastCompanion())
  else goTo('datos')
}

// "Cambiar" o un error en Revisar
function editFromReview(target: EditTarget): void {
  goTo(target.screen, target.companion ?? 1)
}
</script>

<template>
  <component :is="showcase" v-if="showcase" />
  <WelcomeScreen v-else-if="screen === 'bienvenida'" @start="goTo('estancia')" />
  <StayScreen v-else-if="screen === 'estancia'" @back="back('bienvenida')" @next="afterStay" />
  <HolderScreen v-else-if="screen === 'datos'" @back="back('estancia')" @next="afterHolder" />
  <!-- key: cada acompañante es una pantalla nueva (los errores empiezan limpios) -->
  <CompanionScreen
    v-else-if="screen === 'acompanantes'"
    :key="companion"
    :index="companion"
    @back="beforeCompanion"
    @next="afterCompanion"
  />
  <ReviewScreen
    v-else-if="screen === 'revisar'"
    @back="beforeReview"
    @edit="editFromReview"
    @next="goTo('final')"
  />
  <FinalScreen
    v-else-if="screen === 'final'"
    @back="goTo('revisar')"
    @cleared="goTo('bienvenida')"
  />
</template>
