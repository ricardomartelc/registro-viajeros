<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import AppButton from '../shared/AppButton.vue'
import AppIcon from '../shared/AppIcon.vue'
import GuestLayout from './GuestLayout.vue'
import { booking, dataCleared, resetBooking } from './bookingState'
import { t } from '../../i18n'
import { RECEPTION_EMAIL } from '../../config'
import { buildPartialFile } from '../../export/buildPartialFile'

// Pantalla Final: tres pasos (descargar el archivo, enviarlo por correo, borrar los datos).
const emit = defineEmits<{ back: []; cleared: [] }>()

// Paso 1: el archivo todavía no se genera (Bloque 5). El botón está desactivado.
const fileReady = computed(() => buildPartialFile(booking).ok)

// Paso 2: copiar la dirección de correo.
// Si el navegador no deja copiar, se enseña la dirección en un campo ya seleccionado.
const email = RECEPTION_EMAIL
const reference = computed(() => booking.stay.reference)
const copyState = ref<'idle' | 'copied' | 'fallback'>('idle')
const fallbackInput = ref<HTMLInputElement>()

async function copyEmail(): Promise<void> {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Sin portapapeles')
    await navigator.clipboard.writeText(email)
    copyState.value = 'copied'
  } catch {
    copyState.value = 'fallback'
    await nextTick()
    fallbackInput.value?.focus()
    fallbackInput.value?.select()
  }
}

// Paso 3: borrar los datos, con confirmación en la propia página.
const confirming = ref(false)

function clearData(): void {
  resetBooking()
  dataCleared.value = true
  emit('cleared') // App.vue vuelve a la bienvenida, que enseña "Sus datos se han borrado."
}
</script>

<template>
  <GuestLayout :step="4" :title="t('final.title')" :intro="t('final.intro')" hide-draft-notice>
    <ol class="steps">
      <!-- Paso 1 -->
      <li class="step">
        <span class="step__number" aria-hidden="true">1</span>
        <div class="step__body">
          <h2 class="step__title">
            <span class="visually-hidden">{{ t('final.stepLabel').replace('{n}', '1') }}:</span>
            {{ t('final.step1Title') }}
          </h2>
          <p class="step__text">{{ t('final.step1Text') }}</p>
          <AppButton
            class="step__button"
            :disabled="!fileReady"
            :aria-describedby="fileReady ? undefined : 'descarga-pronto'"
          >
            <AppIcon name="download" />
            {{ t('final.download') }}
          </AppButton>
          <p v-if="!fileReady" id="descarga-pronto" class="step__note">
            {{ t('final.downloadSoon') }}
          </p>
        </div>
      </li>

      <!-- Paso 2 -->
      <li class="step">
        <span class="step__number" aria-hidden="true">2</span>
        <div class="step__body">
          <h2 class="step__title">
            <span class="visually-hidden">{{ t('final.stepLabel').replace('{n}', '2') }}:</span>
            {{ t('final.step2Title') }}
          </h2>
          <p class="step__text">{{ t('final.step2Text') }}</p>

          <dl class="data">
            <div class="data__row">
              <dt class="data__label">{{ t('final.emailLabel') }}</dt>
              <dd class="data__value data__value--email">{{ email }}</dd>
            </div>
            <div v-if="reference" class="data__row">
              <dt class="data__label">{{ t('final.referenceLabel') }}</dt>
              <dd class="data__value">{{ reference }}</dd>
            </div>
          </dl>

          <AppButton variant="outline" class="step__button" @click="copyEmail">
            {{ t('final.copy') }}
          </AppButton>

          <!-- Si no se puede copiar: la dirección en un campo seleccionado -->
          <div v-if="copyState === 'fallback'" class="fallback">
            <label for="direccion-correo" class="fallback__label">{{ t('final.copyFallback') }}</label>
            <input
              id="direccion-correo"
              ref="fallbackInput"
              class="fallback__input"
              type="text"
              :value="email"
              readonly
            />
          </div>
          <p role="status" class="step__status">
            {{ copyState === 'copied' ? t('final.copied') : '' }}
          </p>
        </div>
      </li>

      <!-- Paso 3 -->
      <li class="step">
        <span class="step__number" aria-hidden="true">3</span>
        <div class="step__body">
          <h2 class="step__title">
            <span class="visually-hidden">{{ t('final.stepLabel').replace('{n}', '3') }}:</span>
            {{ t('final.step3Title') }}
          </h2>
          <p class="step__text">{{ t('final.step3Text') }}</p>

          <AppButton
            v-if="!confirming"
            variant="outline"
            class="step__button"
            @click="confirming = true"
          >
            {{ t('draft.clear') }}
          </AppButton>
          <div v-else class="confirm" role="group" :aria-label="t('draft.confirm')">
            <p class="confirm__question">{{ t('draft.confirm') }}</p>
            <div class="confirm__buttons">
              <AppButton variant="outline" class="confirm__yes" @click="clearData">
                {{ t('draft.confirmYes') }}
              </AppButton>
              <AppButton variant="outline" class="confirm__no" @click="confirming = false">
                {{ t('draft.cancel') }}
              </AppButton>
            </div>
          </div>
        </div>
      </li>
    </ol>

    <p class="privacy">{{ t('final.privacy') }}</p>

    <AppButton variant="outline" class="back" @click="emit('back')">
      {{ t('final.backToReview') }}
    </AppButton>
  </GuestLayout>
</template>

<style scoped>
/* Lista agrupada: una tarjeta con los tres pasos separados por líneas finas */
.steps {
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
}
.step {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-4);
}
.step + .step {
  border-top: 1px solid var(--color-line);
}
/* Número grande en círculo */
.step__number {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: var(--space-7);
  height: var(--space-7);
  border-radius: var(--radius-pill);
  background: var(--color-ink);
  color: var(--color-surface);
  font-family: var(--font-display);
  font-size: var(--text-title);
  font-variant-numeric: tabular-nums;
}
.step__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 0;
}
.step__title {
  font-size: var(--text-title);
}
.step__text {
  margin: 0;
  max-width: 65ch;
}
.step__button {
  width: 100%;
}
.step__note,
.step__status {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-muted);
}
.step__status:empty {
  display: none;
}
.step__status {
  color: var(--color-ink);
  font-weight: 600;
}
.data {
  margin: 0;
}
.data__row {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-2) 0;
}
.data__label {
  font-size: var(--text-sm);
  color: var(--color-muted);
}
.data__value {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  overflow-wrap: anywhere;
  font-variant-numeric: tabular-nums;
}
/* La dirección se selecciona entera de un toque (para copiarla a mano) */
.data__value--email {
  user-select: all;
  -webkit-user-select: all;
}
.fallback {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.fallback__label {
  font-size: var(--text-sm);
}
.fallback__input {
  width: 100%;
  min-height: var(--tap-min);
  padding: 0 var(--space-3);
  border: 1px solid var(--color-field-border);
  border-radius: var(--radius-field);
  background: var(--color-surface);
  color: var(--color-ink);
  font-size: var(--text-base);
}
.confirm {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.confirm__question {
  margin: 0;
  font-weight: 600;
}
.confirm__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.privacy {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-muted);
}
.back {
  width: 100%;
}
</style>
