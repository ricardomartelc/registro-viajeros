<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '../shared/AppButton.vue'
import { t } from '../../i18n'
import { resetBooking, storageAvailable } from './bookingState'

// Aviso del guardado temporal y botón "Borrar mis datos".
// Antes de borrar se pide confirmación aquí mismo (sin la ventana confirm() del navegador).
const confirming = ref(false)
const cleared = ref(false)

function ask(): void {
  confirming.value = true
  cleared.value = false
}

function confirmClear(): void {
  resetBooking()
  confirming.value = false
  cleared.value = true
}
</script>

<template>
  <section class="draft">
    <p class="draft__text">
      {{ storageAvailable ? t('draft.notice') : t('draft.unavailable') }}
    </p>

    <button v-if="!confirming" type="button" class="draft__clear" @click="ask">
      {{ t('draft.clear') }}
    </button>

    <div v-else class="draft__confirm">
      <p class="draft__question">{{ t('draft.confirm') }}</p>
      <div class="draft__buttons">
        <AppButton variant="outline" @click="confirmClear">{{ t('draft.confirmYes') }}</AppButton>
        <AppButton variant="outline" @click="confirming = false">{{ t('draft.cancel') }}</AppButton>
      </div>
    </div>

    <!-- role="status": el lector de pantalla anuncia que se han borrado los datos -->
    <p role="status" class="draft__status">{{ cleared ? t('draft.cleared') : '' }}</p>
  </section>
</template>

<style scoped>
.draft {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  font-size: var(--text-sm);
  color: var(--color-muted);
}
.draft__text,
.draft__question {
  margin: 0;
}
.draft__clear {
  align-self: flex-start;
  min-height: var(--tap-min);
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-link);
  font-size: var(--text-base);
  text-decoration: underline;
  cursor: pointer;
}
.draft__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.draft__status {
  margin: 0;
  color: var(--color-ink);
}
.draft__status:empty {
  display: none;
}
</style>
