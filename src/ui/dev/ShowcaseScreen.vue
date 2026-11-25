<script setup lang="ts">
// Página de muestra de piezas. SOLO DESARROLLO: se abre con ?muestra=1 y no llega a producción
// (ver App.vue). Todos los datos son inventados. Los textos van aquí sin i18n a propósito.
import { ref } from 'vue'
import AppButton from '../shared/AppButton.vue'
import AppIcon from '../shared/AppIcon.vue'
import ChipGroup from '../shared/ChipGroup.vue'
import FloatingBar from '../shared/FloatingBar.vue'
import FormGroup from '../shared/FormGroup.vue'
import FormRow from '../shared/FormRow.vue'
import StepIndicator from '../shared/StepIndicator.vue'
import SummaryCard from '../shared/SummaryCard.vue'
import TextField from '../shared/TextField.vue'
import type { Option, SummaryRow } from '../shared/types'
import fotoCasa from '../../assets/photos/plano-general-casa.jpg'

const steps = [
  { icon: 'home' as const, label: 'Estancia' },
  { icon: 'user' as const, label: 'Datos' },
  { icon: 'users' as const, label: 'Acompañantes' },
  { icon: 'check' as const, label: 'Revisar' },
]

const documentTypes: Option[] = [
  { value: 'dni', label: 'DNI', icon: 'id' },
  { value: 'nie', label: 'NIE', icon: 'id' },
  { value: 'pasaporte', label: 'Pasaporte', icon: 'id' },
  { value: 'otro', label: 'Otro' },
]
const documentType = ref('dni')

const countries: Option[] = [
  { value: 'ES', label: 'España', icon: 'globe' },
  { value: 'DE', label: 'Alemania', icon: 'globe' },
  { value: 'GB', label: 'Reino Unido', icon: 'globe' },
  { value: 'FR', label: 'Francia', icon: 'globe' },
]
const country = ref('ES')

const companions: Option[] = [
  { value: 'pareja', label: 'Pareja' },
  { value: 'hijos', label: 'Hijos' },
  { value: 'amigos', label: 'Amigos' },
  { value: 'familia', label: 'Otra familia' },
]
const travelsWith = ref<string[]>(['pareja'])

const name = ref('Ana')
const email = ref('ana@ejemplo.test')
const docNumber = ref('123')

const summary: SummaryRow[] = [
  { label: 'Nombre', value: 'Ana Ejemplo Prueba' },
  { label: 'Documento', value: 'DNI 00000000T' },
  { label: 'Nacionalidad', value: 'España' },
  { label: 'Entrada', value: '12/07/2027' },
  { label: 'Salida', value: '19/07/2027' },
]

const barItems: Option[] = [
  { value: 'inicio', label: 'Inicio', icon: 'home' },
  { value: 'datos', label: 'Datos', icon: 'user' },
  { value: 'buscar', label: 'Buscar', icon: 'search' },
  { value: 'enviar', label: 'Enviar', icon: 'mail' },
]
const barActive = ref('inicio')
</script>

<template>
  <main class="showcase">
    <h1>Muestra de piezas</h1>
    <p class="showcase__note">Solo desarrollo · datos inventados</p>

    <section class="block">
      <h2>Botones</h2>
      <AppButton class="full">Principal (primary)</AppButton>
      <AppButton variant="outline" class="full">Secundario (outline)</AppButton>
      <div class="photo">
        <img :src="fotoCasa" alt="" />
        <div class="photo__buttons">
          <AppButton variant="glass-accent">
            Cristal rojo <AppIcon name="arrow" />
          </AppButton>
          <AppButton variant="glass">Cristal</AppButton>
        </div>
      </div>
    </section>

    <section class="block">
      <h2>Indicador de pasos</h2>
      <StepIndicator :steps="steps" :current="1" />
    </section>

    <section class="block">
      <h2>Chips · selección única</h2>
      <ChipGroup v-model="documentType" legend="Tipo de documento" :options="documentTypes" />
      <ChipGroup v-model="country" legend="País de nacionalidad" :options="countries" />
      <p class="showcase__note">Elegido: {{ documentType }} · {{ country }}</p>
    </section>

    <section class="block">
      <h2>Chips · selección múltiple</h2>
      <ChipGroup
        v-model="travelsWith"
        legend="¿Con quién viaja?"
        :options="companions"
        multiple
      />
      <p class="showcase__note">Elegidos: {{ travelsWith.join(', ') || 'ninguno' }}</p>
    </section>

    <section class="block">
      <h2>Campos en lista agrupada</h2>
      <FormGroup title="Datos personales" note="Escriba los datos como aparecen en su documento.">
        <FormRow>
          <TextField
            v-model="name"
            label="Nombre"
            autocomplete="given-name"
            enterkeyhint="next"
          />
        </FormRow>
        <FormRow>
          <TextField
            v-model="email"
            label="Correo electrónico"
            type="email"
            hint="Solo para enviarle la copia del registro."
            autocomplete="email"
            inputmode="email"
            enterkeyhint="next"
            optional
          />
        </FormRow>
        <FormRow>
          <TextField
            v-model="docNumber"
            label="Número de documento"
            hint="Por ejemplo: 00000000T"
            error="El número de documento es demasiado corto."
            autocomplete="off"
            enterkeyhint="done"
          />
        </FormRow>
      </FormGroup>

      <FormGroup title="Estancia">
        <FormRow label="Entrada">12/07/2027</FormRow>
        <FormRow label="Salida">19/07/2027</FormRow>
        <FormRow label="Personas">3</FormRow>
      </FormGroup>
    </section>

    <section class="block">
      <h2>Tarjeta de resumen</h2>
      <SummaryCard title="Resumen de la estancia" :rows="summary" />
    </section>

    <FloatingBar v-model="barActive" label="Navegación de muestra" :items="barItems" />
  </main>
</template>

<style scoped>
.showcase {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: var(--layout-max-width);
  margin: 0 auto;
  padding: calc(var(--space-5) + env(safe-area-inset-top)) var(--space-4)
    /* Hueco abajo para que la barra flotante no tape nada */
    calc(var(--floating-bar-height) + var(--space-7) + env(safe-area-inset-bottom));
}
.showcase__note {
  margin: 0;
  color: var(--color-muted);
  font-size: var(--text-sm);
}
.block {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.block h2 {
  font-size: var(--text-title);
}
.full {
  width: 100%;
}
.photo {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-card);
}
.photo img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  object-position: 50% 85%;
}
.photo__buttons {
  position: absolute;
  inset: auto 0 var(--space-4) 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
}
</style>
