<script setup lang="ts">
import { computed } from 'vue'
import ChipGroup from '../shared/ChipGroup.vue'
import DateField from '../shared/DateField.vue'
import FormGroup from '../shared/FormGroup.vue'
import FormRow from '../shared/FormRow.vue'
import SelectField from '../shared/SelectField.vue'
import TextField from '../shared/TextField.vue'
import type { Option } from '../shared/types'
import type { PersonForm } from './usePersonForm'
import { locale, t, type MessageKey } from '../../i18n'
import { countryOptions } from '../../i18n/countries'
import { RULES, isSpain, secondSurnameRequiredFor } from '../../domain/rules'
import { RELATIONSHIP_CODES } from '../../domain/relationships'
import type { DocumentType, Sex } from '../../domain/types'

// Formulario de UNA persona (titular o acompañante): datos personales, documento,
// domicilio y contacto. La lógica viene de usePersonForm().
// - hideAddress / hideContact: ocultan esos campos (cuando se copian del titular).
// - Huecos (slots) 'address-switch' y 'contact-switch': para poner una casilla
//   al principio de esos bloques (la usa CompanionScreen).
const props = defineProps<{ form: PersonForm; hideAddress?: boolean; hideContact?: boolean }>()

// Se sacan las piezas del formulario para usarlas directamente en la plantilla.
const {
  person,
  errorFor,
  leave,
  fieldId,
  touched,
  needsSupportNumber,
  needsRelationship,
  documentOptional,
} = props.form

// Segundo apellido: obligatorio con DNI; si no, opcional (rules.ts).
const surname2Optional = computed(() => !secondSurnameRequiredFor(person.value.documentType))

// Parentesco: lista de códigos del documento de diseño (etiquetas por confirmar).
const relationshipOptions = computed(() =>
  RELATIONSHIP_CODES.map((code) => ({
    value: code,
    label: t(`relationship.${code}` as MessageKey),
  })),
)

// Ayuda del correo: "Máximo 50 caracteres…"
const emailHint = computed(() =>
  t('person.emailHint').replace('{max}', String(RULES.emailMaxLength)),
)

// Opciones de chips y listas (textos por i18n)
const sexOptions = computed<Option[]>(() =>
  (['hombre', 'mujer', 'otro'] as const).map((value) => ({
    value,
    label: t(`sex.${value}` as MessageKey),
  })),
)
const documentOptions = computed<Option[]>(() =>
  (['dni', 'nie', 'pasaporte', 'otro'] as const).map((value) => ({
    value,
    label: t(`doc.${value}` as MessageKey),
    icon: 'id',
  })),
)
const countries = computed(() => countryOptions(locale.value))

// ChipGroup trabaja con textos; el modelo usa tipos más estrictos.
const sex = computed({
  get: () => person.value.sex,
  set: (value: string | string[]) => {
    person.value.sex = value as Sex
    touched.add('sex')
  },
})
const documentType = computed({
  get: () => person.value.documentType,
  set: (value: string | string[]) => {
    person.value.documentType = value as DocumentType
    touched.add('documentType')
  },
})

// Código postal: teclado numérico si el país es España.
const postalInputMode = computed(() => (isSpain(person.value.address.country) ? 'numeric' : 'text'))
</script>

<template>
  <FormGroup :title="t('holder.groupPersonal')">
    <FormRow>
      <TextField
        :id="fieldId('firstName')"
        v-model="person.firstName"
        :label="t('person.firstName')"
        :error="errorFor('firstName')"
        autocomplete="given-name"
        enterkeyhint="next"
        @focusout="leave('firstName')"
      />
    </FormRow>
    <FormRow>
      <TextField
        :id="fieldId('surname1')"
        v-model="person.surname1"
        :label="t('person.surname1')"
        :error="errorFor('surname1')"
        autocomplete="family-name"
        enterkeyhint="next"
        @focusout="leave('surname1')"
      />
    </FormRow>
    <FormRow>
      <TextField
        :id="fieldId('surname2')"
        v-model="person.surname2"
        :label="t('person.surname2')"
        :hint="surname2Optional ? undefined : t('person.surname2RequiredHint')"
        :error="errorFor('surname2')"
        autocomplete="off"
        enterkeyhint="next"
        :optional="surname2Optional"
        @focusout="leave('surname2')"
      />
    </FormRow>
    <FormRow>
      <ChipGroup
        :id="fieldId('sex')"
        v-model="sex"
        :legend="t('person.sex')"
        :options="sexOptions"
        :error="errorFor('sex')"
      />
    </FormRow>
    <FormRow>
      <DateField
        :id="fieldId('birthDate')"
        v-model="person.birthDate"
        :legend="t('person.birthDate')"
        :hint="t('date.hintBirth')"
        :error="errorFor('birthDate')"
        birthday
        @leave="leave('birthDate')"
      />
    </FormRow>
    <FormRow>
      <SelectField
        :id="fieldId('nationality')"
        v-model="person.nationality"
        :label="t('person.nationality')"
        :options="countries"
        :error="errorFor('nationality')"
        @focusout="leave('nationality')"
      />
    </FormRow>
    <!-- Parentesco: solo menores de 18 a la fecha de entrada; lista de códigos -->
    <FormRow v-if="needsRelationship">
      <SelectField
        :id="fieldId('relationship')"
        v-model="person.relationship"
        :label="t('person.relationship')"
        :hint="t('person.relationshipHint')"
        :options="relationshipOptions"
        :error="errorFor('relationship')"
        @focusout="leave('relationship')"
      />
    </FormRow>
  </FormGroup>

  <!-- Documento: obligatorio para mayores de 18; opcional para menores -->
  <FormGroup
    :title="t('holder.groupDocument')"
    :note="documentOptional ? t('person.documentOptionalMinor') : undefined"
  >
    <FormRow>
      <ChipGroup
        :id="fieldId('documentType')"
        v-model="documentType"
        :legend="t('person.documentType')"
        :options="documentOptions"
        :error="errorFor('documentType')"
      />
    </FormRow>
    <FormRow v-if="person.documentType">
      <TextField
        :id="fieldId('documentNumber')"
        v-model="person.documentNumber"
        :label="t('person.documentNumber')"
        :error="errorFor('documentNumber')"
        autocomplete="off"
        enterkeyhint="next"
        :optional="documentOptional"
        @focusout="leave('documentNumber')"
      />
    </FormRow>
    <FormRow v-if="needsSupportNumber">
      <TextField
        :id="fieldId('supportNumber')"
        v-model="person.supportNumber"
        :label="t('person.supportNumber')"
        :hint="t('person.supportHint')"
        :error="errorFor('supportNumber')"
        autocomplete="off"
        enterkeyhint="next"
        @focusout="leave('supportNumber')"
      />
    </FormRow>
  </FormGroup>

  <FormGroup :title="t('holder.groupAddress')">
    <FormRow v-if="$slots['address-switch']">
      <slot name="address-switch" />
    </FormRow>
    <template v-if="!hideAddress">
      <FormRow>
        <TextField
          :id="fieldId('address.street')"
          v-model="person.address.street"
          :label="t('person.street')"
          :error="errorFor('address.street')"
          autocomplete="street-address"
          enterkeyhint="next"
          @focusout="leave('address.street')"
        />
      </FormRow>
      <FormRow>
        <TextField
          :id="fieldId('address.complement')"
          v-model="person.address.complement"
          :label="t('person.complement')"
          :hint="t('person.complementHint')"
          :error="errorFor('address.complement')"
          autocomplete="address-line2"
          enterkeyhint="next"
          optional
          @focusout="leave('address.complement')"
        />
      </FormRow>
      <FormRow>
        <TextField
          :id="fieldId('address.city')"
          v-model="person.address.city"
          :label="t('person.city')"
          :error="errorFor('address.city')"
          autocomplete="address-level2"
          enterkeyhint="next"
          @focusout="leave('address.city')"
        />
      </FormRow>
      <FormRow>
        <SelectField
          :id="fieldId('address.country')"
          v-model="person.address.country"
          :label="t('person.country')"
          :options="countries"
          :error="errorFor('address.country')"
          autocomplete="country"
          @focusout="leave('address.country')"
        />
      </FormRow>
      <FormRow>
        <TextField
          :id="fieldId('address.postalCode')"
          v-model="person.address.postalCode"
          :label="t('person.postalCode')"
          :error="errorFor('address.postalCode')"
          autocomplete="postal-code"
          :inputmode="postalInputMode"
          enterkeyhint="next"
          @focusout="leave('address.postalCode')"
        />
      </FormRow>
    </template>
  </FormGroup>

  <!-- Contacto: móvil obligatorio; fijo y correo opcionales -->
  <FormGroup :title="t('holder.groupContact')">
    <FormRow v-if="$slots['contact-switch']">
      <slot name="contact-switch" />
    </FormRow>
    <template v-if="!hideContact">
      <FormRow>
        <TextField
          :id="fieldId('phone')"
          v-model="person.phone"
          type="tel"
          :label="t('person.phone')"
          :error="errorFor('phone')"
          autocomplete="tel"
          inputmode="tel"
          enterkeyhint="next"
          @focusout="leave('phone')"
        />
      </FormRow>
      <FormRow>
        <TextField
          :id="fieldId('phone2')"
          v-model="person.phone2"
          type="tel"
          :label="t('person.phone2')"
          :error="errorFor('phone2')"
          autocomplete="off"
          inputmode="tel"
          enterkeyhint="next"
          optional
          @focusout="leave('phone2')"
        />
      </FormRow>
      <FormRow>
        <TextField
          :id="fieldId('email')"
          v-model="person.email"
          type="email"
          :label="t('person.email')"
          :hint="emailHint"
          :error="errorFor('email')"
          autocomplete="email"
          inputmode="email"
          enterkeyhint="done"
          optional
          @focusout="leave('email')"
        />
      </FormRow>
    </template>
  </FormGroup>
</template>
