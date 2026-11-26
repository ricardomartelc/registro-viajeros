import type { DocumentType } from './types'

// Reglas configurables que dependen de la edad, del tipo de documento o de la reserva.
// Alineadas con el documento de diseño (plantilla v1.1.0) y el formulario en papel del
// propietario; el XSD real tendrá la última palabra. Cambiar aquí, no en los validadores.
export const RULES = {
  // Edad a partir de la cual una persona es adulta.
  adultAge: 18,
  // Edad a partir de la cual el documento (tipo y número) es obligatorio.
  // Documento de diseño: solo para mayores de edad. Si un menor lo rellena, se valida igual.
  documentRequiredFromAge: 18,
  // Tipos de documento que llevan número de soporte.
  supportNumberRequiredFor: ['dni', 'nie'] as DocumentType[],
  // Tipos de documento con los que el segundo apellido es obligatorio (DNI/NIF).
  secondSurnameRequiredFor: ['dni'] as DocumentType[],
  // Los menores deben indicar su parentesco con un adulto de la reserva.
  relationshipRequiredForMinors: true,
  // El número de personas de la estancia debe coincidir con la lista de personas.
  peopleCountMustMatch: true,
  // Máximo de personas por reserva (capacidad de la casa).
  maxPeople: 6,
  // Debe haber al menos un adulto en la reserva.
  atLeastOneAdult: true,
  // Código postal español: las dos primeras cifras deben ser de provincia (01 a 52).
  checkSpanishProvince: true,
  // Teléfono móvil obligatorio (formulario en papel). El fijo y el correo, opcionales.
  mobileRequired: true,
  // Longitud máxima del correo (documento de diseño).
  emailMaxLength: 50,
}

// ¿Es España? Acepta 'ES' y 'ESP'.
export function isSpain(countryCode: string): boolean {
  const code = countryCode.trim().toUpperCase()
  return code === 'ES' || code === 'ESP'
}

export function isMinorAge(age: number): boolean {
  return age < RULES.adultAge
}

export function documentRequiredAtAge(age: number): boolean {
  return age >= RULES.documentRequiredFromAge
}

export function supportNumberRequiredFor(type: DocumentType | ''): boolean {
  return type !== '' && RULES.supportNumberRequiredFor.includes(type)
}

export function secondSurnameRequiredFor(type: DocumentType | ''): boolean {
  return type !== '' && RULES.secondSurnameRequiredFor.includes(type)
}

export function relationshipRequiredAtAge(age: number): boolean {
  return RULES.relationshipRequiredForMinors && isMinorAge(age)
}
