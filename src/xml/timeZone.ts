import { TIME_ZONE } from './schema'

// Desfase horario de España (Europe/Madrid) para una fecha y hora LOCALES de la casa,
// p. ej. '2027-07-12' y '16:00' → '+02:00'; '2027-01-15' y '16:00' → '+01:00'.
//
// Se calcula con Intl.DateTimeFormat (sin librerías). Nunca se usa new Date() con
// una cadena: solo con números (milisegundos UTC), que no tienen ambigüedad.
//
// Casos raros del cambio de hora (decisión propia, ver informe):
// - Marzo, 02:00-02:59 no existe (el reloj salta a las 03:00): se usa +02:00.
// - Octubre, 02:00-02:59 ocurre dos veces: se usa la primera vez, +02:00.

const HOUR = 60 * 60 * 1000

// Desfase en horas (1 o 2) de Europe/Madrid en un instante UTC.
function offsetHoursAt(utcMs: number): number {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: TIME_ZONE,
      timeZoneName: 'longOffset',
    }).formatToParts(new Date(utcMs))
    const name = parts.find((part) => part.type === 'timeZoneName')?.value ?? ''
    // 'GMT+01:00' o 'GMT+02:00'
    const match = /GMT([+-])(\d{2}):(\d{2})/.exec(name)
    if (match) {
      const sign = match[1] === '-' ? -1 : 1
      return sign * (Number(match[2]) + Number(match[3]) / 60)
    }
  } catch {
    // Navegador sin 'longOffset': se usa la regla europea de abajo.
  }
  return euRuleOffsetHours(utcMs)
}

// Plan B (navegadores antiguos): regla de la UE. Horario de verano desde el último domingo
// de marzo a la 01:00 UTC hasta el último domingo de octubre a la 01:00 UTC.
function lastSundayUtc(year: number, month: number): number {
  const lastDay = new Date(Date.UTC(year, month + 1, 0)) // último día del mes
  const back = lastDay.getUTCDay() // 0 = domingo
  return Date.UTC(year, month, lastDay.getUTCDate() - back, 1, 0)
}
function euRuleOffsetHours(utcMs: number): number {
  const year = new Date(utcMs).getUTCFullYear()
  const summer = utcMs >= lastSundayUtc(year, 2) && utcMs < lastSundayUtc(year, 9)
  return summer ? 2 : 1
}

// 'AAAA-MM-DD' + 'HH:MM' (hora local de la casa) → '+01:00' o '+02:00'
export function madridOffset(date: string, time: string): string {
  const [year, month, day] = date.split('-').map(Number) as [number, number, number]
  const [hour, minute] = time.split(':').map(Number) as [number, number]
  // La hora local escrita como si fuera UTC
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute)

  // ¿Es coherente suponer +01:00? ¿Y +02:00? (comprobando el desfase real en ese instante)
  const winterOk = offsetHoursAt(localAsUtc - 1 * HOUR) === 1
  const summerOk = offsetHoursAt(localAsUtc - 2 * HOUR) === 2

  let hours: number
  if (summerOk) hours = 2 // verano, o la hora repetida de octubre (primera vez)
  else if (winterOk) hours = 1 // invierno
  else hours = 2 // la hora que no existe en marzo: ya es horario de verano

  return `+0${hours}:00`
}

// '2027-07-12' + '16:00' → '2027-07-12T16:00:00+02:00'
export function madridDateTime(date: string, time: string): string {
  return `${date}T${time}:00${madridOffset(date, time)}`
}
