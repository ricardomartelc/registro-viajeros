import { booking, sameAddressFor, sameContactFor } from './bookingState'
import { FIELD_LABELS, fieldLabel, personFieldId, stayFieldId } from './fieldLabels'
import { locale, t, type MessageKey } from '../../i18n'
import { countryName } from '../../i18n/countries'
import { errorText } from '../../i18n/errors'
import { formatDate } from '../../i18n/format'
import { relationshipRequiredAtAge } from '../../domain/rules'
import { isRelationshipCode } from '../../domain/relationships'
import { validateDate } from '../../domain/validators/dates'
import { validateBooking, validatePerson, type FieldPath } from '../../domain/validateBooking'
import type { SummaryRow } from '../shared/types'

// Lógica de la pantalla Revisar (sin la parte visual): las filas de cada tarjeta
// y la lista de errores con su persona o bloque y adónde lleva cada uno.

// Pantalla a la que lleva "Cambiar" o un error (y campo, si es un error).
export interface EditTarget {
  screen: 'estancia' | 'datos' | 'acompanantes'
  companion?: number // posición del acompañante (1, 2...)
  fieldId?: string
}

export interface ReviewError {
  target: EditTarget
  label: string // "Acompañante 2: Fecha de nacimiento"
  text: string // "Este dato es obligatorio."
}

// ---------- Nombres de los bloques ----------

export const stayTitle = () => t('review.stay')
export const holderTitle = () => t('review.holder')
export const companionTitle = (index: number) =>
  t('review.companion').replace('{n}', String(index + 1))

// ---------- Filas de las tarjetas ----------

const missing = () => t('review.missing')
const orMissing = (text: string) => (text.trim() ? text : missing())
const label = (key: MessageKey) => t(key)

// '2027-07-12' → "12 de julio de 2027"
const date = (text: string) => (text ? formatDate(text, locale.value) : missing())

export function stayRows(): SummaryRow[] {
  const stay = booking.stay
  const rows: SummaryRow[] = [{ label: label('stay.reference'), value: orMissing(stay.reference) }]
  // Fecha del contrato: solo si se ha indicado (es opcional)
  if (stay.contractDate) {
    rows.push({ label: label('review.contractDate'), value: date(stay.contractDate) })
  }
  rows.push(
    { label: label('review.checkIn'), value: date(stay.checkInDate) },
    { label: label('review.checkOut'), value: date(stay.checkOutDate) },
    { label: label('stay.people'), value: String(stay.numberOfPeople || missing()) },
  )
  return rows
}

// Fecha de entrada si es válida (para calcular la edad).
const checkInDate = () =>
  validateDate(booking.stay.checkInDate) === null ? booking.stay.checkInDate : null

export function personRows(index: number, today: string): SummaryRow[] {
  const p = booking.people[index]!
  const lang = locale.value
  const name = [p.firstName, p.surname1, p.surname2].filter((part) => part.trim()).join(' ')
  const document = p.documentType
    ? [t(`doc.${p.documentType}` as MessageKey), p.documentNumber].filter(Boolean).join(' ')
    : ''
  const { street, complement, city, postalCode, country } = p.address
  const address = [
    street,
    complement,
    [postalCode, city].filter(Boolean).join(' '),
    country ? countryName(country, lang) : '',
  ]
    .filter(Boolean)
    .join(', ')

  const rows: SummaryRow[] = [
    { label: label('review.name'), value: orMissing(name) },
    { label: label('person.sex'), value: p.sex ? t(`sex.${p.sex}` as MessageKey) : missing() },
    {
      label: label('person.birthDate'),
      value: p.birthDate ? formatDate(p.birthDate, lang) : missing(),
    },
    {
      label: label('person.nationality'),
      value: p.nationality ? countryName(p.nationality, lang) : missing(),
    },
    { label: label('review.document'), value: orMissing(document) },
  ]
  // Opcionales: solo si tienen algo
  if (p.supportNumber) rows.push({ label: label('person.supportNumber'), value: p.supportNumber })
  rows.push({ label: label('review.address'), value: orMissing(address) })
  rows.push({ label: label('person.phone'), value: orMissing(p.phone) }) // móvil: obligatorio
  if (p.phone2) rows.push({ label: label('person.phone2'), value: p.phone2 })
  if (p.email) rows.push({ label: label('person.email'), value: p.email })

  // Parentesco: solo si es menor a la fecha de entrada (se muestra su nombre, no el código)
  const { age } = validatePerson(p, index, checkInDate(), today)
  if (age !== null && relationshipRequiredAtAge(age)) {
    const relationship = isRelationshipCode(p.relationship)
      ? t(`relationship.${p.relationship}` as MessageKey)
      : missing()
    rows.push({ label: label('person.relationship'), value: relationship })
  }
  return rows
}

// ---------- Errores ----------

const isAddressField = (field: FieldPath) => field.startsWith('address.')
const isContactField = (field: FieldPath) =>
  field === 'phone' || field === 'phone2' || field === 'email'

// Orden: estancia, titular, acompañantes; dentro de cada uno, el orden de los campos en pantalla.
const FIELD_ORDER = Object.keys(FIELD_LABELS)

// Valida toda la reserva y devuelve los errores listos para el resumen de Revisar.
// Los errores de domicilio o contacto copiados del titular se asocian al titular
// (el campo está oculto en el acompañante; hay que corregirlo en Datos).
export function reviewErrors(today: string): ReviewError[] {
  const seen = new Set<string>()
  const result: (ReviewError & { order: number })[] = []

  for (const error of validateBooking(booking, today)) {
    let personIndex = error.personIndex
    let field = error.field

    // Copiado del titular → error del titular
    if (personIndex !== null && personIndex > 0) {
      const copied =
        (isAddressField(field) && sameAddressFor(personIndex)) ||
        (isContactField(field) && sameContactFor(personIndex))
      if (copied) personIndex = 0
    }
    // "Sin adulto": se corrige en las fechas de nacimiento, empezando por el titular
    if (field === 'people') {
      personIndex = 0
      field = 'birthDate'
    }

    let target: EditTarget
    let block: string
    if (personIndex === null) {
      target = { screen: 'estancia', fieldId: stayFieldId(field) }
      block = stayTitle()
    } else if (personIndex === 0) {
      target = { screen: 'datos', fieldId: personFieldId(field) }
      block = holderTitle()
    } else {
      target = { screen: 'acompanantes', companion: personIndex, fieldId: personFieldId(field) }
      block = companionTitle(personIndex)
    }

    // Sin repetir (p. ej. el mismo error copiado en varios acompañantes)
    const key = `${personIndex}|${field}|${error.code}`
    if (seen.has(key)) continue
    seen.add(key)

    const name = fieldLabel(field)
    result.push({
      target,
      label: name ? `${block}: ${name}` : block,
      text: errorText(error.code),
      order: (personIndex === null ? 0 : personIndex + 1) * 1000 + FIELD_ORDER.indexOf(field),
    })
  }

  return result
    .sort((a, b) => a.order - b.order)
    .map(({ target, label: errorLabel, text }) => ({ target, label: errorLabel, text }))
}

// ¿Tiene errores este bloque? (para marcar su tarjeta)
export function blockHasErrors(errors: ReviewError[], target: EditTarget): boolean {
  return errors.some(
    (error) => error.target.screen === target.screen && error.target.companion === target.companion,
  )
}
