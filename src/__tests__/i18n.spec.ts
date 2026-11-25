import { describe, it, expect, afterEach } from 'vitest'

import { es } from '../i18n/es'
import { en } from '../i18n/en'
import { locale, setLocale, t } from '../i18n'

describe('i18n', () => {
  afterEach(() => setLocale('es'))

  it('ES y EN tienen las mismas claves', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort())
  })

  it('ningún texto da una cifra de minutos', () => {
    const allTexts = [...Object.values(es), ...Object.values(en)]
    for (const text of allTexts) {
      expect(text).not.toMatch(/\d+\s*(min|minutos|minutes)/i)
    }
  })

  it('t() devuelve el texto en el idioma actual', () => {
    expect(locale.value).toBe('es')
    expect(t('welcome.start')).toBe('Comenzar')

    setLocale('en')
    expect(t('welcome.start')).toBe('Start')
    expect(document.documentElement.lang).toBe('en')
  })
})
