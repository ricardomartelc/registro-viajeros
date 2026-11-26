import { computed, reactive, ref, watch } from 'vue'
import { booking, localToday, reviewNav } from './bookingState'
import { personFieldId, summaryItems } from './fieldLabels'
import { errorText } from '../../i18n/errors'
import { cleanPerson } from '../../domain/normalize'
import {
  documentRequiredAtAge,
  relationshipRequiredAtAge,
  supportNumberRequiredFor,
} from '../../domain/rules'
import { validateDate } from '../../domain/validators/dates'
import { validatePerson, type FieldPath } from '../../domain/validateBooking'

// Lógica del formulario de UNA persona (titular o acompañante), sin la parte visual.
// La usan HolderScreen y CompanionScreen; lo visual está en PersonFields.vue.
export function usePersonForm(personIndex: number) {
  const person = computed(() => booking.people[personIndex]!)

  // Fecha de entrada (solo si es válida): sirve para calcular la edad.
  const checkInDate = computed(() =>
    validateDate(booking.stay.checkInDate) === null ? booking.stay.checkInDate : null,
  )
  const result = computed(() =>
    validatePerson(person.value, personIndex, checkInDate.value, localToday()),
  )
  const errors = computed(() => result.value.errors)

  // Un error se enseña cuando la persona ha salido del campo o ha pulsado "Siguiente".
  // Si se llega desde un error de Revisar, los errores se enseñan desde el principio.
  const touched = reactive(new Set<FieldPath>())
  const submitted = ref(reviewNav.focusField !== null)

  function errorFor(...fields: FieldPath[]): string | undefined {
    if (!submitted.value && !fields.some((field) => touched.has(field))) return undefined
    const found = errors.value.find((error) => fields.includes(error.field))
    return found ? errorText(found.code) : undefined
  }

  // Limpia los espacios de todos los textos de la persona.
  function clean(): void {
    Object.assign(person.value, cleanPerson(person.value))
  }

  // Al salir de un campo: se limpian los espacios y se marca como visitado.
  function leave(field: FieldPath): void {
    clean()
    touched.add(field)
  }

  // id de cada campo: 'address.city' → 'campo-address-city'. El error de contacto lleva al teléfono.
  const fieldId = personFieldId

  const summaryList = computed(() =>
    submitted.value ? summaryItems(errors.value, fieldId) : [],
  )

  // Número de soporte: solo si el tipo de documento lo exige (rules.ts). Si deja de pedirse, se vacía.
  const needsSupportNumber = computed(() => supportNumberRequiredFor(person.value.documentType))
  watch(needsSupportNumber, (needed) => {
    if (!needed) person.value.supportNumber = ''
  })

  // Parentesco: solo si es menor a la fecha de entrada (rules.ts).
  const needsRelationship = computed(
    () => result.value.age !== null && relationshipRequiredAtAge(result.value.age),
  )

  // Documento opcional: solo si se sabe que es menor de 18 a la fecha de entrada (rules.ts).
  const documentOptional = computed(
    () => result.value.age !== null && !documentRequiredAtAge(result.value.age),
  )

  return {
    person,
    errors,
    touched,
    submitted,
    errorFor,
    clean,
    leave,
    fieldId,
    summaryList,
    needsSupportNumber,
    needsRelationship,
    documentOptional,
  }
}

export type PersonForm = ReturnType<typeof usePersonForm>
