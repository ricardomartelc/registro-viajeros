// Funciones de fechas sin usar new Date(): así no hay errores por zona horaria
// ni por cambio de hora. Las fechas son texto 'AAAA-MM-DD' y las horas 'HH:MM'.

export interface DateParts {
  year: number
  month: number // 1 a 12
  day: number
}

const DATE_FORMAT = /^(\d{4})-(\d{2})-(\d{2})$/
const TIME_FORMAT = /^([01]\d|2[0-3]):[0-5]\d$/

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function daysInMonth(year: number, month: number): number {
  const days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return days[month - 1] ?? 0
}

// Separa 'AAAA-MM-DD' en números. Devuelve null si el formato no es ese.
// No comprueba si la fecha existe (para eso, isRealDate).
export function parseDate(text: string): DateParts | null {
  const match = DATE_FORMAT.exec(text)
  if (!match) return null
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) }
}

export function hasDateFormat(text: string): boolean {
  return parseDate(text) !== null
}

// ¿Existe la fecha en el calendario? (p. ej. 2023-02-29 no existe; 2024-02-29 sí)
export function isRealDate(text: string): boolean {
  const date = parseDate(text)
  if (!date) return false
  return (
    date.year >= 1 &&
    date.month >= 1 &&
    date.month <= 12 &&
    date.day >= 1 &&
    date.day <= daysInMonth(date.year, date.month)
  )
}

export function isValidTime(text: string): boolean {
  return TIME_FORMAT.test(text)
}

// Edad cumplida en una fecha dada (no la de hoy).
// Nacidos el 29 de febrero: en un año no bisiesto se considera que cumplen
// el 1 de marzo (opción prudente: son menores un día más). Por confirmar.
// Las dos fechas deben ser reales (isRealDate).
export function ageOn(birthDate: string, onDate: string): number {
  const birth = parseDate(birthDate)!
  const on = parseDate(onDate)!

  let birthdayMonth = birth.month
  let birthdayDay = birth.day
  if (birth.month === 2 && birth.day === 29 && !isLeapYear(on.year)) {
    birthdayMonth = 3
    birthdayDay = 1
  }

  let age = on.year - birth.year
  const beforeBirthday = on.month < birthdayMonth || (on.month === birthdayMonth && on.day < birthdayDay)
  if (beforeBirthday) age -= 1
  return age
}
