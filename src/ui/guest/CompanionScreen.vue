<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import AppButton from '../shared/AppButton.vue'
import CheckboxField from '../shared/CheckboxField.vue'
import ErrorSummary from '../shared/ErrorSummary.vue'
import GuestLayout from './GuestLayout.vue'
import PersonFields from './PersonFields.vue'
import { usePersonForm } from './usePersonForm'
import {
  applySharedData,
  booking,
  sameAddressFor,
  sameContactFor,
  setSameAddress,
  setSameContact,
} from './bookingState'
import { locale, t } from '../../i18n'
import { countryName } from '../../i18n/countries'
import { FREE_NAVIGATION } from '../../config'

// Pantalla de UN acompañante ("Acompañante 2 de 4"). index = posición en la lista
// de personas (0 es el titular, así que aquí siempre es 1 o más).
// App.vue la vuelve a crear para cada acompañante (key), así los errores empiezan limpios.
const props = defineProps<{ index: number }>()
const emit = defineEmits<{ back: []; next: [] }>()

const form = usePersonForm(props.index)
const holder = computed(() => booking.people[0]!)
const total = computed(() => booking.people.length)

const title = computed(() =>
  t('companions.title')
    .replace('{actual}', String(props.index + 1))
    .replace('{total}', String(total.value)),
)

// Casillas "Mismo domicilio" y "Usar el contacto del titular" (marcadas por defecto).
// Al marcarlas se copian los datos del titular.
const sameAddress = computed({
  get: () => sameAddressFor(props.index),
  set: (value: boolean) => setSameAddress(props.index, value),
})
const sameContact = computed({
  get: () => sameContactFor(props.index),
  set: (value: boolean) => setSameContact(props.index, value),
})

// Lo que se copia, en una línea, para que la persona vea qué se va a usar.
const holderAddressText = computed(() => {
  const { street, city, postalCode, country } = holder.value.address
  const countryText = country ? countryName(country, locale.value) : ''
  return [street, [postalCode, city].filter(Boolean).join(' '), countryText]
    .filter(Boolean)
    .join(', ')
})
const holderContactText = computed(() =>
  [holder.value.phone, holder.value.email].filter(Boolean).join(' · '),
)

// Al abrir la pantalla, se copian los datos del titular si las casillas están marcadas.
onMounted(() => applySharedData())

const summary = ref<InstanceType<typeof ErrorSummary>>()

async function submit(): Promise<void> {
  applySharedData()
  form.clean()
  form.submitted.value = true
  // Con errores no se avanza (salvo en el modo pruebas de navegación libre, ver config.ts)
  if (form.errors.value.length > 0 && !FREE_NAVIGATION) {
    await nextTick()
    summary.value?.focus()
    return
  }
  // App.vue decide: el siguiente acompañante, o Revisar si es el último o se viene de Revisar.
  emit('next')
}
</script>

<template>
  <GuestLayout :step="2" :title="title" :intro="t('companions.intro')">
    <ErrorSummary ref="summary" :items="form.summaryList.value" />

    <form novalidate class="form" @submit.prevent="submit">
      <PersonFields :form="form" :hide-address="sameAddress" :hide-contact="sameContact">
        <template #address-switch>
          <CheckboxField
            v-model="sameAddress"
            :label="t('companions.sameAddress')"
            :hint="sameAddress ? holderAddressText : undefined"
          />
        </template>
        <template #contact-switch>
          <CheckboxField
            v-model="sameContact"
            :label="t('companions.sameContact')"
            :hint="sameContact ? holderContactText : undefined"
          />
        </template>
      </PersonFields>

      <div class="actions">
        <AppButton type="submit" class="actions__button">{{ t('nav.next') }}</AppButton>
        <AppButton variant="outline" class="actions__button" @click="emit('back')">
          {{ t('nav.back') }}
        </AppButton>
      </div>
    </form>
  </GuestLayout>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.actions__button {
  width: 100%;
}
</style>
