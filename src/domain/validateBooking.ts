import type { Address, Booking, Person, Stay } from './types'
import type { ErrorCode } from './errors'
import { ageOn } from './dates'
import {
  RULES,
  documentRequiredAtAge,
  isMinorAge,
  relationshipRequiredAtAge,
  supportNumberRequiredFor,
} from './rules'
import { validateDocumentNumber } from './validators/documents'
import { validateBirthDate, validateCheckOut, validateDate, validateTime } from './validators/dates'
import { validatePostalCode } from './validators/postalCode'
import { validateName } from './validators/names'
import { validateEmail, validatePhone } from './validators/contact'
import { cleanPerson, cleanStay } from './normalize'

// Campo al que se refiere un error: de la estancia, de la persona o de su domicilio.
// 'contact' = teléfono y correo juntos; 'people' = la lista de personas.
export type FieldPath =
  | keyof Stay
  | keyof Person
  | `address.${keyof Address}`
  | 'contact'
  | 'people'

export interface ValidationError {
  personIndex: number | null // null = error de la estancia o de la reserva entera
  field: FieldPath
  code: ErrorCode
}

function isBlank(text: string): boolean {
  return text.trim() === ''
}

// Valida la reserva completa y devuelve todos los errores (lista vacía = todo correcto).
// 'today' es la fecha de hoy en 'AAAA-MM-DD' (se pasa desde fuera para que la función sea pura).
export function validateBooking(booking: Booking, today: string): ValidationError[] {
  const { stay, people } = booking
  const errors = validateStay(stay)

  // Regla de la reserva entera: se comprueba aquí (pantalla Revisar), no en la pantalla Estancia.
  if (RULES.peopleCountMustMatch && Number(stay.numberOfPeople) !== people.length) {
    errors.push({ personIndex: null, field: 'numberOfPeople', code: 'reserva.personasNoCoinciden' })
  }

  // La edad se calcula a la fecha de entrada: solo si esa fecha es válida.
  const checkInDate = validateDate(stay.checkInDate) === null ? stay.checkInDate : null

  const ages = people.map((person, index) => {
    const result = validatePerson(person, index, checkInDate, today)
    errors.push(...result.errors)
    return result.age
  })

  // Al menos un adulto: solo se comprueba si se conoce la edad de todos.
  if (RULES.atLeastOneAdult && people.length > 0 && ages.every((age) => age !== null)) {
    if (ages.every((age) => isMinorAge(age!))) {
      errors.push({ personIndex: null, field: 'people', code: 'reserva.sinAdulto' })
    }
  }

  return errors
}

// Valida solo la estancia (pantalla Estancia). Limpia los espacios antes de validar.
export function validateStay(dirtyStay: Stay): ValidationError[] {
  const stay = cleanStay(dirtyStay)
  const errors: ValidationError[] = []
  const add = (field: FieldPath, code: ErrorCode) => errors.push({ personIndex: null, field, code })

  if (isBlank(stay.reference)) add('reference', 'campo.obligatorio')

  // Cada fecha y hora: obligatoria y con formato correcto.
  const parts = [
    ['checkInDate', validateDate],
    ['checkInTime', validateTime],
    ['checkOutDate', validateDate],
    ['checkOutTime', validateTime],
  ] as const
  let allValid = true
  for (const [field, validate] of parts) {
    const value = stay[field]
    const code = isBlank(value) ? 'campo.obligatorio' : validate(value)
    if (code) {
      add(field, code)
      allValid = false
    }
  }

  // Solo si las cuatro partes están bien, se compara la salida con la entrada.
  if (allValid) {
    const code = validateCheckOut(
      stay.checkInDate,
      stay.checkInTime,
      stay.checkOutDate,
      stay.checkOutTime,
    )
    if (code) add('checkOutDate', code)
  }

  // Número de personas: se convierte a número antes de validar (por si llega como texto).
  // Vacío, decimal, negativo o no numérico → 'personas.formato'.
  const peopleCount = Number(stay.numberOfPeople)
  if (!Number.isInteger(peopleCount) || peopleCount < 1) {
    add('numberOfPeople', 'personas.formato')
  }

  // Datos de pago: opcionales y sin validar (por confirmar con la plantilla del ministerio).
  return errors
}

// Valida una persona (pantallas Datos y Acompañantes). Limpia los espacios antes de validar.
// Devuelve sus errores y su edad a la fecha de entrada (null si no se puede calcular).
export function validatePerson(
  dirtyPerson: Person,
  personIndex: number,
  checkInDate: string | null,
  today: string,
): { errors: ValidationError[]; age: number | null } {
  const person = cleanPerson(dirtyPerson)
  const errors: ValidationError[] = []
  const add = (field: FieldPath, code: ErrorCode) => errors.push({ personIndex, field, code })

  // Nombre y apellidos
  for (const field of ['firstName', 'surname1'] as const) {
    if (isBlank(person[field])) add(field, 'campo.obligatorio')
    else {
      const code = validateName(person[field])
      if (code) add(field, code)
    }
  }
  if (!isBlank(person.surname2)) {
    const code = validateName(person.surname2)
    if (code) add('surname2', code)
  }

  if (person.sex === '') add('sex', 'campo.obligatorio')
  if (isBlank(person.nationality)) add('nationality', 'campo.obligatorio')

  // Fecha de nacimiento y edad a la fecha de entrada
  let age: number | null = null
  if (isBlank(person.birthDate)) add('birthDate', 'campo.obligatorio')
  else {
    const code = validateBirthDate(person.birthDate, today)
    if (code) add('birthDate', code)
    else if (checkInDate) age = ageOn(person.birthDate, checkInDate)
  }

  // Documento. Si no se sabe la edad, se pide (opción prudente).
  const documentRequired = age === null || documentRequiredAtAge(age)
  if (person.documentType === '') {
    if (documentRequired) add('documentType', 'documento.obligatorio')
  } else {
    if (isBlank(person.documentNumber)) {
      if (documentRequired) add('documentNumber', 'documento.obligatorio')
    } else {
      const code = validateDocumentNumber(person.documentType, person.documentNumber)
      if (code) add('documentNumber', code)
    }
    if (supportNumberRequiredFor(person.documentType) && isBlank(person.supportNumber)) {
      add('supportNumber', 'soporte.obligatorio')
    }
  }

  // Domicilio: todos los campos obligatorios (por confirmar con la plantilla del ministerio).
  const { address } = person
  if (isBlank(address.street)) add('address.street', 'campo.obligatorio')
  if (isBlank(address.city)) add('address.city', 'campo.obligatorio')
  if (isBlank(address.country)) add('address.country', 'campo.obligatorio')
  if (isBlank(address.postalCode)) add('address.postalCode', 'campo.obligatorio')
  else {
    const code = validatePostalCode(address.postalCode, address.country)
    if (code) add('address.postalCode', code)
  }

  // Contacto: al menos uno de los dos (según rules.ts). Formato siempre que se rellene.
  if (RULES.atLeastOneContact && isBlank(person.phone) && isBlank(person.email)) {
    add('contact', 'contacto.obligatorio')
  }
  if (!isBlank(person.phone)) {
    const code = validatePhone(person.phone)
    if (code) add('phone', code)
  }
  if (!isBlank(person.email)) {
    const code = validateEmail(person.email)
    if (code) add('email', code)
  }

  // Parentesco: obligatorio para menores (según rules.ts)
  if (age !== null && relationshipRequiredAtAge(age) && isBlank(person.relationship)) {
    add('relationship', 'parentesco.obligatorio')
  }

  return { errors, age }
}
