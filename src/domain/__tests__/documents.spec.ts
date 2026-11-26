import { describe, it, expect } from 'vitest'

import {
  validateDni,
  validateNie,
  validateOtherDocument,
  validateDocumentNumber,
} from '../validators/documents'

// Todos los números son inventados (calculados para que la letra cuadre).

describe('DNI', () => {
  it('acepta DNI con la letra correcta', () => {
    expect(validateDni('12345678Z')).toBeNull()
    expect(validateDni('00000000T')).toBeNull()
    expect(validateDni('99999999R')).toBeNull()
  })

  it('acepta minúsculas, espacios, puntos y guiones', () => {
    expect(validateDni('12345678z')).toBeNull()
    expect(validateDni('12.345.678-Z')).toBeNull()
    expect(validateDni(' 12345678 Z ')).toBeNull()
  })

  it('detecta la letra incorrecta', () => {
    expect(validateDni('12345678A')).toBe('dni.letraIncorrecta')
  })

  it('detecta el formato incorrecto', () => {
    expect(validateDni('1234567Z')).toBe('dni.formato') // 7 cifras
    expect(validateDni('123456789Z')).toBe('dni.formato') // 9 cifras
    expect(validateDni('12345678')).toBe('dni.formato') // sin letra
    expect(validateDni('X1234567L')).toBe('dni.formato') // es un NIE
  })
})

describe('NIE', () => {
  it('acepta NIE con X, Y y Z (valen 0, 1 y 2)', () => {
    expect(validateNie('X1234567L')).toBeNull()
    expect(validateNie('Y0000000Z')).toBeNull()
    expect(validateNie('Z0000000M')).toBeNull()
    expect(validateNie('x-1234567-l')).toBeNull()
  })

  it('detecta la letra incorrecta', () => {
    expect(validateNie('X1234567A')).toBe('nie.letraIncorrecta')
  })

  it('detecta el formato incorrecto', () => {
    expect(validateNie('A1234567L')).toBe('nie.formato')
    expect(validateNie('X123456L')).toBe('nie.formato')
    expect(validateNie('12345678Z')).toBe('nie.formato')
  })
})

describe('Pasaporte y otros', () => {
  it('acepta solo letras y números, sin letra de control', () => {
    expect(validateOtherDocument('AB1234567')).toBeNull()
    expect(validateOtherDocument('ab12')).toBeNull()
  })

  it('rechaza espacios y símbolos', () => {
    expect(validateOtherDocument('AB 1234567')).toBe('documento.formato')
    expect(validateOtherDocument('AB-1234567')).toBe('documento.formato')
    expect(validateOtherDocument('')).toBe('documento.formato')
  })

  it('validateDocumentNumber elige la regla según el tipo', () => {
    expect(validateDocumentNumber('dni', '12345678A')).toBe('dni.letraIncorrecta')
    expect(validateDocumentNumber('nie', 'X1234567L')).toBeNull()
    expect(validateDocumentNumber('pasaporte', '12345678A')).toBeNull() // sin letra del DNI
    expect(validateDocumentNumber('otro', 'A B')).toBe('documento.formato')
  })
})
