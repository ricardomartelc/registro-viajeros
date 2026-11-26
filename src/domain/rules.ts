import type { DocumentType } from './types'

// Reglas configurables que dependen de la edad, del tipo de documento o de la reserva.
// TODAS por confirmar con el XSD del ministerio: cambiar aquí, no en los validadores.
export const RULES = {
  // Edad a partir de la cual una persona es adulta.
  adultAge: 18,
  // Edad a partir de la cual el documento (tipo y número) es obligatorio.
  documentRequiredFromAge: 14,
  // Tipos de documento que llevan número de soporte.
  supportNumberRequiredFor: ['dni', 'nie'] as DocumentType[],
  // Los menores deben indicar su parentesco con un adulto de la reserva.
  relationshipRequiredForMinors: true,
  // El número de personas de la estancia debe coincidir con la lista de personas.
  peopleCountMustMatch: true,
  // Debe haber al menos un adulto en la reserva.
  atLeastOneAdult: true,
  // Código postal español: las dos primeras cifras deben ser de provincia (01 a 52).
  checkSpanishProvince: true,
  // Al menos uno de los dos (teléfono o correo) es obligatorio, también para menores
  // (por confirmar si aplica a menores). Si se rellena alguno, siempre se comprueba su formato.
  atLeastOneContact: true,
}

// ¿Es España? Acepta 'ES' y 'ESP' hasta confirmar el formato de país del ministerio.
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

export function relationshipRequiredAtAge(age: number): boolean {
  return RULES.relationshipRequiredForMinors && isMinorAge(age)
}
