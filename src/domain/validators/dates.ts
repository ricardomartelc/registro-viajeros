import type { ErrorCode } from '../errors'
import { hasDateFormat, isRealDate, isValidTime } from '../dates'

// La fecha tiene formato 'AAAA-MM-DD' y existe en el calendario.
export function validateDate(text: string): ErrorCode | null {
  if (!hasDateFormat(text)) return 'fecha.formato'
  if (!isRealDate(text)) return 'fecha.noExiste'
  return null
}

// La hora tiene formato 'HH:MM' (00:00 a 23:59).
export function validateTime(text: string): ErrorCode | null {
  return isValidTime(text) ? null : 'hora.formato'
}

// Fecha de nacimiento válida y no posterior a hoy. 'today' se pasa desde fuera
// ('AAAA-MM-DD') para que la función sea pura y fácil de probar.
export function validateBirthDate(birthDate: string, today: string): ErrorCode | null {
  const dateError = validateDate(birthDate)
  if (dateError) return dateError
  return birthDate > today ? 'nacimiento.futuro' : null
}

// La fecha de salida es estrictamente posterior a la de entrada (al menos una noche).
// Las horas ya no las rellena el huésped (las pone el propietario).
// Las dos fechas deben venir ya validadas. Con el formato 'AAAA-MM-DD', comparar los
// textos da el mismo orden que comparar las fechas.
export function validateCheckOut(checkInDate: string, checkOutDate: string): ErrorCode | null {
  return checkOutDate > checkInDate ? null : 'salida.noPosterior'
}

// Fecha del contrato (opcional): válida, no futura y no posterior a la entrada.
// 'checkInDate' puede ser null si la fecha de entrada todavía no es válida.
export function validateContractDate(
  contractDate: string,
  checkInDate: string | null,
  today: string,
): ErrorCode | null {
  const dateError = validateDate(contractDate)
  if (dateError) return dateError
  if (contractDate > today) return 'contrato.futuro'
  if (checkInDate && contractDate > checkInDate) return 'contrato.posteriorEntrada'
  return null
}
