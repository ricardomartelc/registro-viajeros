import type { Address, Booking, Person, Stay } from './types'
import type { ErrorCode } from './errors'
import { ageOn } from './dates'
import {
  RULES,
  documentRequiredAtAge,
  isMinorAge,
  relationshipRequiredAtAge,
  secondSurnameRequiredFor,
  supportNumberRequiredFor,
} from './rules'
import { isRelationshipCode } from './relationships'
import { validateDocumentNumber } from './validators/documents'
import {
  validateBirthDate,
  validateCheckOut,
  validateContractDate,
  validateDate,
} from './validators/dates'
import { validatePostalCode } from './validators/postalCode'
import { validateName } from './validators/names'
import { validateEmail, validatePhone } from './validators/contact'
import { cleanPerson, cleanStay } from './normalize'

// Campo al que se refiere un error: de la estancia, de la persona o de su domicilio.
// 'people' = la lista de personas (reglas de la reserva entera).
export type FieldPath = keyof Stay | keyof Person | `address.${keyof Address}` | 'people'

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
  const errors = validateStay(stay, today)

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
// Las horas y la forma de pago ya no las rellena el huésped (las pone el propietario).
export function validateStay(dirtyStay: Stay, today: string): ValidationError[] {
  const stay = cleanStay(dirtyStay)
  const errors: ValidationError[] = []
  const add = (field: FieldPath, code: ErrorCode) => errors.push({ personIndex: null, field, code })

  if (isBlank(stay.reference)) add('reference', 'campo.obligatorio')

  // Fechas de entrada y salida: obligatorias y existentes; la salida, posterior.
  let datesValid = true
  for (const field of ['checkInDate', 'checkOutDate'] as const) {
    const value = stay[field]
    const code = isBlank(value) ? 'campo.obligatorio' : validateDate(value)
    if (code) {
      add(field, code)
      datesValid = false
    }
  }
  if (datesValid) {
    const code = validateCheckOut(stay.checkInDate, stay.checkOutDate)
    if (code) add('checkOutDate', code)
  }

  // Fecha del contrato (opcional): si se rellena, válida, no futura y no posterior a la entrada.
  if (!isBlank(stay.contractDate)) {
    const checkIn = validateDate(stay.checkInDate) === null ? stay.checkInDate : null
    const code = validateContractDate(stay.contractDate, checkIn, today)
    if (code) add('contractDate', code)
  }

  // Número de personas: se convierte a número antes de validar (por si llega como texto).
  // Vacío, decimal, negativo o no numérico → 'personas.formato'. Más de 6 → 'personas.maximo'.
  const peopleCount = Number(stay.numberOfPeople)
  if (!Number.isInteger(peopleCount) || peopleCount < 1) {
    add('numberOfPeople', 'personas.formato')
  } else if (peopleCount > RULES.maxPeople) {
    add('numberOfPeople', 'personas.maximo')
  }

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

  // Nombre y apellidos. El segundo apellido es obligatorio con DNI (rules.ts).
  const surname2Required = secondSurnameRequiredFor(person.documentType)
  for (const field of ['firstName', 'surname1', 'surname2'] as const) {
    const required = field !== 'surname2' || surname2Required
    if (isBlank(person[field])) {
      if (required) add(field, 'campo.obligatorio')
    } else {
      const code = validateName(person[field])
      if (code) add(field, code)
    }
  }

  // Sexo y nacionalidad: la plantilla los marca opcionales, pero el formulario los exige
  // (decisión del propietario: su formulario en papel los marca como obligatorios).
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

  // Documento: obligatorio para mayores de 18. Si no se sabe la edad, se pide (prudente).
  // Si un menor lo rellena, se valida igual.
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

  // Domicilio: obligatorio salvo el complemento.
  const { address } = person
  if (isBlank(address.street)) add('address.street', 'campo.obligatorio')
  if (isBlank(address.city)) add('address.city', 'campo.obligatorio')
  if (isBlank(address.country)) add('address.country', 'campo.obligatorio')
  if (isBlank(address.postalCode)) add('address.postalCode', 'campo.obligatorio')
  else {
    const code = validatePostalCode(address.postalCode, address.country)
    if (code) add('address.postalCode', code)
  }

  // Contacto: móvil obligatorio; fijo y correo opcionales (formato si se rellenan).
  if (isBlank(person.phone)) {
    if (RULES.mobileRequired) add('phone', 'campo.obligatorio')
  } else {
    const code = validatePhone(person.phone)
    if (code) add('phone', code)
  }
  if (!isBlank(person.phone2)) {
    const code = validatePhone(person.phone2)
    if (code) add('phone2', code)
  }
  if (!isBlank(person.email)) {
    if (person.email.length > RULES.emailMaxLength) add('email', 'correo.largo')
    else {
      const code = validateEmail(person.email)
      if (code) add('email', code)
    }
  }

  // Parentesco: obligatorio para menores (rules.ts), con un código de la lista.
  if (age !== null && relationshipRequiredAtAge(age) && !isRelationshipCode(person.relationship)) {
    add('relationship', 'parentesco.obligatorio')
  }

  return { errors, age }
}
