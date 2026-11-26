import { describe, it, expect } from 'vitest'

import { COUNTRY_CODES } from '../domain/countries'
import { countryName, countryOptions } from '../i18n/countries'

describe('Países', () => {
  it('los códigos son de dos letras y no se repiten', () => {
    expect(new Set(COUNTRY_CODES).size).toBe(COUNTRY_CODES.length)
    for (const code of COUNTRY_CODES) expect(code).toMatch(/^[A-Z]{2}$/)
  })

  it('el nombre sale en el idioma elegido', () => {
    expect(countryName('DE', 'es')).toBe('Alemania')
    expect(countryName('DE', 'en')).toBe('Germany')
  })

  it('España va primero y el resto en orden alfabético', () => {
    const options = countryOptions('es')
    expect(options[0]).toEqual({ value: 'ES', label: 'España' })
    expect(options).toHaveLength(COUNTRY_CODES.length)
    const rest = options.slice(1).map((option) => option.label)
    expect(rest).toEqual([...rest].sort(new Intl.Collator('es').compare))
  })
})
