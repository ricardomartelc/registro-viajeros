import { parseDate } from '../domain/dates'
import type { Locale } from './index'

// Formatos legibles para la pantalla Revisar, en el idioma elegido.

// Idioma completo para Intl: en inglés, el británico escribe "12 July 2027".
const INTL_LOCALE: Record<Locale, string> = { es: 'es-ES', en: 'en-GB' }

// '2027-07-12' → "12 de julio de 2027" / "12 July 2027". Si no es una fecha, la deja igual.
// Se usa la hora UTC para que la zona horaria del móvil no cambie el día.
export function formatDate(text: string, locale: Locale): string {
  const date = parseDate(text)
  if (!date) return text
  const utc = new Date(Date.UTC(date.year, date.month - 1, date.day))
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(utc)
}
