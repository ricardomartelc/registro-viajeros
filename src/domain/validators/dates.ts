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

// La salida (fecha y hora) es estrictamente posterior a la entrada. No exige un día completo.
// Las cuatro partes deben venir ya validadas. Con el formato 'AAAA-MM-DD' y 'HH:MM',
// comparar los textos da el mismo orden que comparar las fechas.
export function validateCheckOut(
  checkInDate: string,
  checkInTime: string,
  checkOutDate: string,
  checkOutTime: string,
): ErrorCode | null {
  const checkIn = `${checkInDate}T${checkInTime}`
  const checkOut = `${checkOutDate}T${checkOutTime}`
  return checkOut > checkIn ? null : 'salida.noPosterior'
}
