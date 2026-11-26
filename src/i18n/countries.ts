import { COUNTRY_CODES } from '../domain/countries'
import type { Locale } from './index'

export interface CountryOption {
  value: string
  label: string
}

// Nombre del país en el idioma elegido, sacado del propio navegador (Intl.DisplayNames).
// Si el navegador no lo sabe hacer, se muestra el código ('ES').
export function countryName(code: string, locale: Locale): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code
  } catch {
    return code
  }
}

// Lista para el <select>: España primero y el resto por orden alfabético en ese idioma.
export function countryOptions(locale: Locale): CountryOption[] {
  const collator = new Intl.Collator(locale)
  const others = COUNTRY_CODES.filter((code) => code !== 'ES')
    .map((code) => ({ value: code, label: countryName(code, locale) }))
    .sort((a, b) => collator.compare(a.label, b.label))
  return [{ value: 'ES', label: countryName('ES', locale) }, ...others]
}
