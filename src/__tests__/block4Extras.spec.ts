import { describe, it, expect } from 'vitest'

import { receptionEmail } from '../config'
import { buildPartialFile } from '../export/buildPartialFile'
import { formatDate } from '../i18n/format'
import { emptyBooking } from '../domain/create'
import { cleanCode } from '../domain/normalize'
import { es } from '../i18n/es'
import { en } from '../i18n/en'

describe('Dirección de recepción (VITE_RECEPTION_EMAIL)', () => {
  it('usa la variable de entorno si existe', () => {
    expect(receptionEmail({ VITE_RECEPTION_EMAIL: ' recepcion@ejemplo.test ' })).toBe(
      'recepcion@ejemplo.test',
    )
  })

  it('sin variable (o vacía) usa el ejemplo inequívoco', () => {
    expect(receptionEmail({})).toBe('registro@ejemplo.invalid')
    expect(receptionEmail({ VITE_RECEPTION_EMAIL: '  ' })).toBe('registro@ejemplo.invalid')
  })
})

describe('Archivo parcial', () => {
  // Bloque 5A: el archivo ya se genera (tests completos en xml.spec.ts).
  // Con una reserva vacía falta un dato obligatorio: no se genera.
  it('con una reserva vacía no se genera (falta un dato obligatorio)', () => {
    expect(buildPartialFile(emptyBooking())).toEqual({ ok: false, error: 'faltaDato' })
  })
})

describe('Formato de fechas legible', () => {
  it('en español y en inglés', () => {
    expect(formatDate('2027-07-12', 'es')).toBe('12 de julio de 2027')
    expect(formatDate('2027-07-12', 'en')).toBe('12 July 2027')
  })

  it('el 1 de enero no cambia de día por la zona horaria', () => {
    expect(formatDate('2027-01-01', 'es')).toBe('1 de enero de 2027')
  })
})

describe('Tolerancia al escribir documentos', () => {
  it('mayúsculas, sin espacios, guiones ni puntos', () => {
    expect(cleanCode('12.345.678-z')).toBe('12345678Z')
    expect(cleanCode(' ab 123 456 ')).toBe('AB123456')
  })
})

describe('Textos nuevos del Bloque 4', () => {
  const keys = Object.keys(es).filter(
    (key) => key.startsWith('review.') || key.startsWith('final.') || key === 'steps.done',
  ) as (keyof typeof es)[]

  it('hay textos de Revisar y Final', () => {
    expect(keys.length).toBeGreaterThan(30)
  })

  it.each(keys)('"%s" existe en español y en inglés', (key) => {
    expect(es[key]).toBeTruthy()
    expect(en[key]).toBeTruthy()
  })
})
