import type { FieldPath, ValidationError } from '../../domain/validateBooking'
import { t, type MessageKey } from '../../i18n'
import { errorText } from '../../i18n/errors'

// Nombre visible de cada campo (clave de i18n), para el resumen de errores:
// "Localizador de la reserva: Este dato es obligatorio."
// El orden de esta lista es el orden de los campos en pantalla: el resumen lo sigue.
export const FIELD_LABELS: Partial<Record<FieldPath, MessageKey>> = {
  // Estancia
  reference: 'stay.reference',
  contractDate: 'stay.contractDate',
  numberOfPeople: 'stay.people',
  checkInDate: 'stay.checkInDate',
  checkOutDate: 'stay.checkOutDate',
  // Persona
  firstName: 'person.firstName',
  surname1: 'person.surname1',
  surname2: 'person.surname2',
  sex: 'person.sex',
  birthDate: 'person.birthDate',
  nationality: 'person.nationality',
  relationship: 'person.relationship',
  documentType: 'person.documentType',
  documentNumber: 'person.documentNumber',
  supportNumber: 'person.supportNumber',
  'address.street': 'person.street',
  'address.complement': 'person.complement',
  'address.city': 'person.city',
  'address.country': 'person.country',
  'address.postalCode': 'person.postalCode',
  phone: 'person.phone',
  phone2: 'person.phone2',
  email: 'person.email',
}

const FIELD_ORDER = Object.keys(FIELD_LABELS)

// id de cada campo en pantalla (los usan los enlaces de los resúmenes de errores).
// Estancia: 'campo-reference'. Persona: 'address.city' → 'campo-address-city'.
export const stayFieldId = (field: FieldPath): string => `campo-${field}`
export const personFieldId = (field: FieldPath): string => `campo-${field.replace('.', '-')}`

// Nombre visible de un campo (o '' si no tiene).
export function fieldLabel(field: FieldPath): string {
  const key = FIELD_LABELS[field]
  return key ? t(key) : ''
}

// Convierte los errores del dominio en las líneas del resumen: enlace al campo,
// nombre del campo y texto del error.
export function summaryItems(errors: ValidationError[], fieldId: (field: FieldPath) => string) {
  const position = (field: FieldPath) => FIELD_ORDER.indexOf(field)
  const sorted = [...errors].sort((a, b) => position(a.field) - position(b.field))
  return sorted.map((error) => {
    const labelKey = FIELD_LABELS[error.field]
    return {
      id: fieldId(error.field),
      label: labelKey ? t(labelKey) : undefined,
      text: errorText(error.code),
    }
  })
}
