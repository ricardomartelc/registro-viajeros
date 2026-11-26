import type { ErrorCode } from '../errors'
import type { DocumentType } from '../types'

// Letras de control del DNI y del NIE: posición = número módulo 23.
const CONTROL_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE'

// Pasa a mayúsculas y quita espacios, guiones y puntos ('12.345.678-z' → '12345678Z').
// Solo para DNI y NIE.
export function normalizeDniNie(text: string): string {
  return text.toUpperCase().replace(/[\s.-]/g, '')
}

function controlLetter(digits: string): string {
  return CONTROL_LETTERS[Number(digits) % 23]!
}

// DNI: 8 cifras y una letra de control.
export function validateDni(text: string): ErrorCode | null {
  const value = normalizeDniNie(text)
  const match = /^(\d{8})([A-Z])$/.exec(value)
  if (!match) return 'dni.formato'
  return controlLetter(match[1]!) === match[2] ? null : 'dni.letraIncorrecta'
}

// NIE: X, Y o Z + 7 cifras + letra de control. X, Y, Z valen 0, 1, 2 para el cálculo.
export function validateNie(text: string): ErrorCode | null {
  const value = normalizeDniNie(text)
  const match = /^([XYZ])(\d{7})([A-Z])$/.exec(value)
  if (!match) return 'nie.formato'
  const firstDigit = 'XYZ'.indexOf(match[1]!)
  return controlLetter(`${firstDigit}${match[2]}`) === match[3] ? null : 'nie.letraIncorrecta'
}

// Pasaporte y otros: solo letras y números, sin espacios. Sin letra de control.
// Sin límite de longitud hasta tener el XSD del ministerio.
export function validateOtherDocument(text: string): ErrorCode | null {
  return /^[A-Za-z0-9]+$/.test(text) ? null : 'documento.formato'
}

// Elige la comprobación según el tipo de documento.
export function validateDocumentNumber(type: DocumentType, text: string): ErrorCode | null {
  if (type === 'dni') return validateDni(text)
  if (type === 'nie') return validateNie(text)
  return validateOtherDocument(text)
}
