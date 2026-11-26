<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import AppButton from '../shared/AppButton.vue'
import DateField from '../shared/DateField.vue'
import ErrorSummary from '../shared/ErrorSummary.vue'
import FormGroup from '../shared/FormGroup.vue'
import FormRow from '../shared/FormRow.vue'
import SelectField from '../shared/SelectField.vue'
import TextField from '../shared/TextField.vue'
import GuestLayout from './GuestLayout.vue'
import { booking, companionsWithData, reviewNav, syncPeopleCount } from './bookingState'
import { stayFieldId, summaryItems } from './fieldLabels'
import { t, type MessageKey } from '../../i18n'
import { errorText } from '../../i18n/errors'
import { cleanStay } from '../../domain/normalize'
import { PAYMENT_METHODS } from '../../domain/payment'
import { validateStay, type FieldPath } from '../../domain/validateBooking'

// Pantalla Estancia: localizador, entrada, salida, número de personas y forma de pago.
const emit = defineEmits<{ back: []; next: [] }>()

// Un error se enseña cuando la persona ha salido del campo o ha pulsado "Siguiente".
// Si se llega desde un error de Revisar, los errores se enseñan desde el principio.
const touched = reactive(new Set<FieldPath>())
const submitted = ref(reviewNav.focusField !== null)
const errors = computed(() => validateStay(booking.stay))

function errorFor(field: FieldPath): string | undefined {
  if (!submitted.value && !touched.has(field)) return undefined
  const found = errors.value.find((error) => error.field === field)
  return found ? errorText(found.code) : undefined
}

// Al salir de un campo: se limpian los espacios y se marca como visitado.
function leave(field: FieldPath): void {
  Object.assign(booking.stay, cleanStay(booking.stay))
  touched.add(field)
}

// id de cada campo (lo usan los enlaces del resumen de errores)
const fieldId = stayFieldId

const summary = ref<InstanceType<typeof ErrorSummary>>()
const summaryList = computed(() => (submitted.value ? summaryItems(errors.value, fieldId) : []))

async function submit(): Promise<void> {
  Object.assign(booking.stay, cleanStay(booking.stay))
  submitted.value = true
  if (errors.value.length > 0) {
    await nextTick()
    summary.value?.focus()
    return
  }
  await goNext()
}

// Acompañantes que se borrarían al bajar el número y ya tienen datos escritos.
const pendingRemoval = ref<number[]>([])
const removalBox = ref<HTMLElement>()

// Ajusta la lista de personas al número indicado. Si se borrarían datos ya escritos,
// primero pide confirmación dentro de la página (sin la ventana confirm() del navegador).
async function goNext(): Promise<void> {
  const withData = companionsWithData(booking.stay.numberOfPeople)
  if (withData.length > 0) {
    pendingRemoval.value = withData
    await nextTick()
    removalBox.value?.focus()
    return
  }
  syncPeopleCount(booking.stay.numberOfPeople)
  emit('next')
}

function confirmRemoval(): void {
  syncPeopleCount(booking.stay.numberOfPeople)
  pendingRemoval.value = []
  emit('next')
}

function cancelRemoval(): void {
  pendingRemoval.value = []
}

// "Acompañante 3 (Leo), Acompañante 4"
const removalNames = computed(() =>
  pendingRemoval.value
    .map((index) => {
      const p = booking.people[index]!
      const name = [p.firstName, p.surname1].filter(Boolean).join(' ')
      const label = t('stay.removePerson').replace('{n}', String(index + 1))
      return name ? `${label} (${name})` : label
    })
    .join(', '),
)

// Número de personas: el campo es texto; se guarda como número (0 si no es un número).
const peopleText = computed({
  get: () => (booking.stay.numberOfPeople ? String(booking.stay.numberOfPeople) : ''),
  set: (text: string) => {
    booking.stay.numberOfPeople = /^\d+$/.test(text.trim()) ? Number(text.trim()) : 0
  },
})

// Forma de pago (opcional): vacío = sin datos de pago.
const paymentOptions = computed(() =>
  PAYMENT_METHODS.map((method) => ({ value: method, label: t(`payment.${method}` as MessageKey) })),
)
const paymentMethod = computed({
  get: () => booking.stay.payment?.method ?? '',
  set: (method: string) => {
    booking.stay.payment = method ? { ...booking.stay.payment, method } : undefined
  },
})
</script>

<template>
  <GuestLayout :step="0" :title="t('stay.title')" :intro="t('stay.intro')">
    <ErrorSummary ref="summary" :items="summaryList" />

    <form novalidate class="form" @submit.prevent="submit">
      <FormGroup :title="t('stay.groupBooking')">
        <FormRow>
          <TextField
            :id="fieldId('reference')"
            v-model="booking.stay.reference"
            :label="t('stay.reference')"
            :hint="t('stay.referenceHint')"
            :error="errorFor('reference')"
            autocomplete="off"
            enterkeyhint="next"
            @focusout="leave('reference')"
          />
        </FormRow>
        <FormRow>
          <TextField
            :id="fieldId('numberOfPeople')"
            v-model="peopleText"
            :label="t('stay.people')"
            :hint="t('stay.peopleHint')"
            :error="errorFor('numberOfPeople')"
            inputmode="numeric"
            autocomplete="off"
            enterkeyhint="next"
            @focusout="leave('numberOfPeople')"
          />
        </FormRow>
      </FormGroup>

      <FormGroup :title="t('stay.groupCheckIn')">
        <FormRow>
          <DateField
            :id="fieldId('checkInDate')"
            v-model="booking.stay.checkInDate"
            :legend="t('stay.checkInDate')"
            :hint="t('date.hint')"
            :error="errorFor('checkInDate')"
            @leave="leave('checkInDate')"
          />
        </FormRow>
        <FormRow>
          <TextField
            :id="fieldId('checkInTime')"
            v-model="booking.stay.checkInTime"
            type="time"
            :label="t('stay.checkInTime')"
            :error="errorFor('checkInTime')"
            enterkeyhint="next"
            @focusout="leave('checkInTime')"
          />
        </FormRow>
      </FormGroup>

      <FormGroup :title="t('stay.groupCheckOut')">
        <FormRow>
          <DateField
            :id="fieldId('checkOutDate')"
            v-model="booking.stay.checkOutDate"
            :legend="t('stay.checkOutDate')"
            :hint="t('date.hint')"
            :error="errorFor('checkOutDate')"
            @leave="leave('checkOutDate')"
          />
        </FormRow>
        <FormRow>
          <TextField
            :id="fieldId('checkOutTime')"
            v-model="booking.stay.checkOutTime"
            type="time"
            :label="t('stay.checkOutTime')"
            :error="errorFor('checkOutTime')"
            enterkeyhint="next"
            @focusout="leave('checkOutTime')"
          />
        </FormRow>
      </FormGroup>

      <FormGroup :title="t('stay.groupPayment')">
        <FormRow>
          <SelectField
            id="campo-payment"
            v-model="paymentMethod"
            :label="t('stay.payment')"
            :options="paymentOptions"
            optional
          />
        </FormRow>
      </FormGroup>

      <!-- Confirmación al bajar el número de personas si se borrarían datos ya escritos -->
      <div
        v-if="pendingRemoval.length"
        ref="removalBox"
        class="remove"
        tabindex="-1"
        role="alert"
        aria-labelledby="quitar-personas-titulo"
      >
        <h2 id="quitar-personas-titulo" class="remove__title">{{ t('stay.removeTitle') }}</h2>
        <p class="remove__text">{{ t('stay.removeText').replace('{personas}', removalNames) }}</p>
        <div class="remove__buttons">
          <AppButton variant="outline" class="remove__confirm" @click="confirmRemoval">
            {{ t('stay.removeConfirm') }}
          </AppButton>
          <AppButton variant="outline" class="remove__cancel" @click="cancelRemoval">
            {{ t('draft.cancel') }}
          </AppButton>
        </div>
      </div>

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
.remove {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 2px solid var(--color-ink);
  border-radius: var(--radius-card);
  background: var(--color-surface);
}
.remove__title {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: 700;
}
.remove__text {
  margin: 0;
}
.remove__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
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
