import { describe, it, expect } from 'vitest'

import { emptyBooking, emptyPerson } from '../create'
import type { Booking, Person } from '../types'
import { validateBooking } from '../validateBooking'

// Datos inventados. "Hoy" fijo para que los tests no cambien con el tiempo.
const TODAY = '2027-06-01'

function adult(): Person {
  return {
    ...emptyPerson(),
    firstName: 'Ana',
    surname1: 'Ejemplo',
    surname2: 'Prueba',
    sex: 'mujer',
    birthDate: '1985-03-10',
    nationality: 'ES',
    documentType: 'dni',
    documentNumber: '12345678Z',
    supportNumber: 'AAA000000',
    address: {
      street: 'Calle Inventada 1',
      complement: '',
      city: 'Alcúdia',
      postalCode: '07400',
      country: 'ES',
    },
    phone: '+34 600 000 000',
    email: 'ana@ejemplo.test',
  }
}

// Menor de 9 años a la entrada: sin documento (opcional), con parentesco.
function child(): Person {
  return {
    ...adult(),
    firstName: 'Leo',
    surname2: '',
    sex: 'hombre',
    birthDate: '2018-01-15',
    documentType: '',
    documentNumber: '',
    supportNumber: '',
    email: '',
    relationship: 'HJ', // hijo/a
  }
}

function validBooking(): Booking {
  return {
    stay: {
      reference: 'RES-0001',
      contractDate: '',
      checkInDate: '2027-07-12',
      checkOutDate: '2027-07-19',
      numberOfPeople: 2,
    },
    people: [adult(), child()],
  }
}

describe('validateBooking', () => {
  it('una reserva correcta no tiene errores', () => {
    expect(validateBooking(validBooking(), TODAY)).toEqual([])
  })

  it('una reserva vacía marca los obligatorios (también el móvil)', () => {
    const errors = validateBooking(emptyBooking(), TODAY)
    expect(errors).toContainEqual({ personIndex: null, field: 'reference', code: 'campo.obligatorio' })
    expect(errors).toContainEqual({ personIndex: 0, field: 'firstName', code: 'campo.obligatorio' })
    expect(errors).toContainEqual({ personIndex: 0, field: 'documentType', code: 'documento.obligatorio' })
    expect(errors).toContainEqual({ personIndex: 0, field: 'phone', code: 'campo.obligatorio' })
    expect(errors).toContainEqual({
      personIndex: 0,
      field: 'address.postalCode',
      code: 'campo.obligatorio',
    })
  })

  it('devuelve los errores por persona y campo', () => {
    const booking = validBooking()
    booking.people[0]!.documentNumber = '12345678A'
    booking.people[0]!.address.postalCode = '99999'
    booking.people[1]!.firstName = 'L3o'
    expect(validateBooking(booking, TODAY)).toEqual([
      { personIndex: 0, field: 'documentNumber', code: 'dni.letraIncorrecta' },
      { personIndex: 0, field: 'address.postalCode', code: 'cp.provincia' },
      { personIndex: 1, field: 'firstName', code: 'nombre.caracteres' },
    ])
  })

  it('fecha de salida no posterior a la de entrada', () => {
    const booking = validBooking()
    booking.stay.checkOutDate = '2027-07-12'
    expect(validateBooking(booking, TODAY)).toEqual([
      { personIndex: null, field: 'checkOutDate', code: 'salida.noPosterior' },
    ])
  })

  it('fecha del contrato: opcional, no futura y no posterior a la entrada', () => {
    const booking = validBooking()
    booking.stay.contractDate = '2027-05-20'
    expect(validateBooking(booking, TODAY)).toEqual([])

    booking.stay.contractDate = '2027-06-15' // después de hoy
    expect(validateBooking(booking, TODAY)).toEqual([
      { personIndex: null, field: 'contractDate', code: 'contrato.futuro' },
    ])

    booking.stay.checkInDate = '2027-05-25'
    booking.stay.checkOutDate = '2027-05-30'
    booking.stay.contractDate = '2027-05-28' // después de la entrada
    const errors = validateBooking(booking, TODAY)
    expect(errors).toContainEqual({
      personIndex: null,
      field: 'contractDate',
      code: 'contrato.posteriorEntrada',
    })
  })

  it('el número de personas debe coincidir con la lista', () => {
    const booking = validBooking()
    booking.stay.numberOfPeople = 3
    expect(validateBooking(booking, TODAY)).toEqual([
      { personIndex: null, field: 'numberOfPeople', code: 'reserva.personasNoCoinciden' },
    ])
  })

  it('como máximo 6 personas', () => {
    const booking = validBooking()
    booking.people = [adult(), adult(), adult(), adult(), adult(), adult()]
    booking.stay.numberOfPeople = 6
    expect(validateBooking(booking, TODAY)).toEqual([])

    booking.people.push(adult())
    booking.stay.numberOfPeople = 7
    expect(validateBooking(booking, TODAY)).toContainEqual({
      personIndex: null,
      field: 'numberOfPeople',
      code: 'personas.maximo',
    })
  })

  it('debe haber al menos un adulto', () => {
    const booking = validBooking()
    booking.people = [child()]
    booking.stay.numberOfPeople = 1
    expect(validateBooking(booking, TODAY)).toContainEqual({
      personIndex: null,
      field: 'people',
      code: 'reserva.sinAdulto',
    })
  })

  it('menor sin parentesco, o con un valor que no es de la lista', () => {
    const booking = validBooking()
    booking.people[1]!.relationship = ''
    expect(validateBooking(booking, TODAY)).toEqual([
      { personIndex: 1, field: 'relationship', code: 'parentesco.obligatorio' },
    ])
    booking.people[1]!.relationship = 'hijo' // texto libre antiguo: ya no vale
    expect(validateBooking(booking, TODAY)).toEqual([
      { personIndex: 1, field: 'relationship', code: 'parentesco.obligatorio' },
    ])
  })

  it('cumple 18 el día de entrada: no necesita parentesco', () => {
    const booking = validBooking()
    booking.people[1] = { ...adult(), birthDate: '2009-07-12', relationship: '' }
    expect(validateBooking(booking, TODAY)).toEqual([])
  })

  it('documento obligatorio solo para mayores de 18, a la fecha de entrada', () => {
    const booking = validBooking()
    // 17 años a la entrada (cumple 18 el día siguiente): sin documento, vale
    booking.people[1] = { ...child(), birthDate: '2009-07-13' }
    expect(validateBooking(booking, TODAY)).toEqual([])

    // Cumple 18 el día de entrada: ya debe llevar documento
    booking.people[1] = { ...child(), birthDate: '2009-07-12', relationship: '' }
    expect(validateBooking(booking, TODAY)).toEqual([
      { personIndex: 1, field: 'documentType', code: 'documento.obligatorio' },
    ])
  })

  it('si un menor rellena el documento, se valida igual', () => {
    const booking = validBooking()
    Object.assign(booking.people[1]!, {
      documentType: 'pasaporte',
      documentNumber: 'AB 12',
    })
    // 'AB 12' se limpia a 'AB12': vale
    expect(validateBooking(booking, TODAY)).toEqual([])

    Object.assign(booking.people[1]!, { documentType: 'dni', documentNumber: '12345678A' })
    const errors = validateBooking(booking, TODAY)
    expect(errors).toContainEqual({
      personIndex: 1,
      field: 'documentNumber',
      code: 'dni.letraIncorrecta',
    })
  })

  it('segundo apellido: obligatorio con DNI, opcional con otros documentos', () => {
    const booking = validBooking()
    booking.people[0]!.surname2 = ''
    expect(validateBooking(booking, TODAY)).toEqual([
      { personIndex: 0, field: 'surname2', code: 'campo.obligatorio' },
    ])
    Object.assign(booking.people[0]!, {
      documentType: 'pasaporte',
      documentNumber: 'AB1234567',
      supportNumber: '',
    })
    expect(validateBooking(booking, TODAY)).toEqual([])
  })

  it('DNI y NIE piden número de soporte; el pasaporte no', () => {
    const booking = validBooking()
    booking.people[0]!.supportNumber = ''
    expect(validateBooking(booking, TODAY)).toEqual([
      { personIndex: 0, field: 'supportNumber', code: 'soporte.obligatorio' },
    ])

    booking.people[0]!.documentType = 'pasaporte'
    booking.people[0]!.documentNumber = 'AB1234567'
    expect(validateBooking(booking, TODAY)).toEqual([])
  })

  it('móvil obligatorio; fijo y correo opcionales', () => {
    const booking = validBooking()
    booking.people[0]!.phone = ''
    expect(validateBooking(booking, TODAY)).toEqual([
      { personIndex: 0, field: 'phone', code: 'campo.obligatorio' },
    ])

    booking.people[0]!.phone = '+34 600 000 000'
    booking.people[0]!.email = ''
    booking.people[0]!.phone2 = ''
    expect(validateBooking(booking, TODAY)).toEqual([])
  })

  it('fijo y correo: si se rellenan, se comprueba su formato', () => {
    const booking = validBooking()
    booking.people[0]!.phone2 = '971 abc'
    booking.people[0]!.email = 'ana@'
    expect(validateBooking(booking, TODAY)).toEqual([
      { personIndex: 0, field: 'phone2', code: 'telefono.formato' },
      { personIndex: 0, field: 'email', code: 'correo.formato' },
    ])
  })

  it('correo de más de 50 caracteres: error propio', () => {
    const booking = validBooking()
    booking.people[0]!.email = `${'a'.repeat(40)}@ejemplo.test` // 53 caracteres
    expect(validateBooking(booking, TODAY)).toEqual([
      { personIndex: 0, field: 'email', code: 'correo.largo' },
    ])
    booking.people[0]!.email = `${'a'.repeat(37)}@ejemplo.test` // 50 caracteres: vale
    expect(validateBooking(booking, TODAY)).toEqual([])
  })

  it('nacimiento futuro y fecha inexistente', () => {
    const booking = validBooking()
    booking.people[0]!.birthDate = '2027-06-02'
    booking.stay.checkInDate = '2027-02-29'
    const errors = validateBooking(booking, TODAY)
    expect(errors).toContainEqual({ personIndex: null, field: 'checkInDate', code: 'fecha.noExiste' })
    expect(errors).toContainEqual({ personIndex: 0, field: 'birthDate', code: 'nacimiento.futuro' })
  })
})
