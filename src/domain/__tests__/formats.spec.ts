import { describe, it, expect } from 'vitest'

import { validatePostalCode } from '../validators/postalCode'
import { validateName } from '../validators/names'
import { validateEmail, validatePhone } from '../validators/contact'

describe('Código postal', () => {
  it('España: 5 cifras y provincia 01 a 52', () => {
    expect(validatePostalCode('07400', 'ES')).toBeNull()
    expect(validatePostalCode('01001', 'ESP')).toBeNull()
    expect(validatePostalCode('52001', 'es')).toBeNull()
    expect(validatePostalCode('7400', 'ES')).toBe('cp.formato')
    expect(validatePostalCode('07 400', 'ES')).toBe('cp.formato')
    expect(validatePostalCode('00123', 'ES')).toBe('cp.provincia')
    expect(validatePostalCode('53001', 'ES')).toBe('cp.provincia')
  })

  it('otros países: formato libre', () => {
    expect(validatePostalCode('SW1A 1AA', 'GB')).toBeNull()
    expect(validatePostalCode('10115', 'DE')).toBeNull()
    expect(validatePostalCode('00123', 'IT')).toBeNull()
  })
})

describe('Nombres y apellidos', () => {
  // Acentos, ñ, guion, apóstrofo y espacios
  it.each(['María José', 'Núñez', 'Peña', "O'Neill", 'D’Angelo', 'Jean-Luc', 'Ève'])(
    'admite "%s"',
    (name) => {
      expect(validateName(name)).toBeNull()
    },
  )

  // Alfabetos no latinos: griego, cirílico, árabe, chino, japonés, devanagari
  it.each(['Ζωή', 'Иван', 'محمد', '王', 'さくら', 'देवी'])('admite "%s"', (name) => {
    expect(validateName(name)).toBeNull()
  })

  // Cifras, símbolos, separadores sueltos o dobles, vacío
  it.each(['Ana2', 'Ana!', '@na', '-Ana', "Ana'", 'Ana  Luz', ''])('rechaza "%s"', (name) => {
    expect(validateName(name)).toBe('nombre.caracteres')
  })
})

describe('Teléfono y correo', () => {
  it('teléfonos válidos e inválidos', () => {
    expect(validatePhone('+34 600 000 000')).toBeNull()
    expect(validatePhone('(971) 00-00-00')).toBeNull()
    expect(validatePhone('12345')).toBe('telefono.formato') // pocas cifras
    expect(validatePhone('+1234567890123456')).toBe('telefono.formato') // demasiadas
    expect(validatePhone('600 abc 000')).toBe('telefono.formato')
  })

  it('correos válidos e inválidos', () => {
    expect(validateEmail('ana@ejemplo.test')).toBeNull()
    expect(validateEmail('ana.luz+viaje@correo.ejemplo.test')).toBeNull()
    expect(validateEmail('ana@ejemplo')).toBe('correo.formato')
    expect(validateEmail('ana ejemplo@correo.test')).toBe('correo.formato')
    expect(validateEmail('@ejemplo.test')).toBe('correo.formato')
  })
})
