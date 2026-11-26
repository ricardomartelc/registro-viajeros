import { describe, it, expect } from 'vitest'

import { ageOn, isLeapYear, isRealDate } from '../dates'
import {
  validateBirthDate,
  validateCheckOut,
  validateContractDate,
  validateDate,
  validateTime,
} from '../validators/dates'
import { isMinorOn } from '../validators/age'

describe('Fechas', () => {
  it('años bisiestos', () => {
    expect(isLeapYear(2024)).toBe(true)
    expect(isLeapYear(2023)).toBe(false)
    expect(isLeapYear(1900)).toBe(false) // divisible por 100 y no por 400
    expect(isLeapYear(2000)).toBe(true) // divisible por 400
  })

  it('29 de febrero solo existe en años bisiestos', () => {
    expect(isRealDate('2024-02-29')).toBe(true)
    expect(isRealDate('2023-02-29')).toBe(false)
    expect(isRealDate('1900-02-29')).toBe(false)
    expect(isRealDate('2000-02-29')).toBe(true)
  })

  it('validateDate distingue formato y fecha inexistente', () => {
    expect(validateDate('2027-07-12')).toBeNull()
    expect(validateDate('2027-04-31')).toBe('fecha.noExiste')
    expect(validateDate('2027-13-01')).toBe('fecha.noExiste')
    expect(validateDate('2027-00-10')).toBe('fecha.noExiste')
    expect(validateDate('12/07/2027')).toBe('fecha.formato')
    expect(validateDate('2027-7-12')).toBe('fecha.formato')
  })

  it('validateTime', () => {
    expect(validateTime('00:00')).toBeNull()
    expect(validateTime('23:59')).toBeNull()
    expect(validateTime('24:00')).toBe('hora.formato')
    expect(validateTime('9:30')).toBe('hora.formato')
  })

  it('nacimiento no futuro (hoy es válido)', () => {
    const today = '2027-07-12'
    expect(validateBirthDate('1990-05-20', today)).toBeNull()
    expect(validateBirthDate('2027-07-12', today)).toBeNull()
    expect(validateBirthDate('2027-07-13', today)).toBe('nacimiento.futuro')
    expect(validateBirthDate('2023-02-29', today)).toBe('fecha.noExiste')
  })

  // Las horas ya no las rellena el huésped: solo se comparan las fechas.
  it('fecha de salida estrictamente posterior a la de entrada', () => {
    expect(validateCheckOut('2027-07-12', '2027-07-19')).toBeNull()
    expect(validateCheckOut('2027-07-12', '2027-07-13')).toBeNull()
    expect(validateCheckOut('2027-07-12', '2027-07-12')).toBe('salida.noPosterior')
    expect(validateCheckOut('2027-07-12', '2027-07-11')).toBe('salida.noPosterior')
  })

  it('fecha del contrato: no futura ni posterior a la entrada', () => {
    const today = '2027-06-01'
    expect(validateContractDate('2027-05-20', '2027-07-12', today)).toBeNull()
    expect(validateContractDate('2027-06-01', '2027-07-12', today)).toBeNull() // hoy vale
    expect(validateContractDate('2027-06-02', '2027-07-12', today)).toBe('contrato.futuro')
    expect(validateContractDate('2027-05-20', '2027-05-10', today)).toBe(
      'contrato.posteriorEntrada',
    )
    expect(validateContractDate('2027-05-20', null, today)).toBeNull() // entrada aún no válida
    expect(validateContractDate('2027-02-30', '2027-07-12', today)).toBe('fecha.noExiste')
  })
})

describe('Edad a la fecha de entrada', () => {
  it('cumple 18 justo el día de entrada: ya es adulto', () => {
    expect(ageOn('2009-07-12', '2027-07-12')).toBe(18)
    expect(isMinorOn('2009-07-12', '2027-07-12')).toBe(false)
  })

  it('el día anterior a cumplir 18: todavía es menor', () => {
    expect(ageOn('2009-07-13', '2027-07-12')).toBe(17)
    expect(isMinorOn('2009-07-13', '2027-07-12')).toBe(true)
  })

  it('usa la fecha de entrada, no la de hoy', () => {
    // Menor al entrar aunque cumpla 18 durante la estancia
    expect(isMinorOn('2009-07-15', '2027-07-12')).toBe(true)
  })

  it('nacidos el 29 de febrero: en año no bisiesto cumplen el 1 de marzo', () => {
    // 2026 no es bisiesto: el 28 de febrero todavía es menor; el 1 de marzo ya es adulto
    expect(isMinorOn('2008-02-29', '2026-02-28')).toBe(true)
    expect(isMinorOn('2008-02-29', '2026-03-01')).toBe(false)
    // 2028 sí es bisiesto: cumplen el 29 de febrero
    expect(ageOn('2008-02-29', '2028-02-28')).toBe(19)
    expect(ageOn('2008-02-29', '2028-02-29')).toBe(20)
  })
})
