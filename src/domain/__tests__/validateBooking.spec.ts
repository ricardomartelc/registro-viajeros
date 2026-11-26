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
    address: { street: 'Calle Inventada 1', city: 'Alcúdia', postalCode: '07400', country: 'ES' },
    phone: '+34 600 000 000',
    email: 'ana@ejemplo.test',
  }
}

function child(): Person {
  return {
    ...adult(),
    firstName: 'Leo',
    sex: 'hombre',
    birthDate: '2019-01-15',
    documentType: '',
    documentNumber: '',
    supportNumber: '',
    phone: '+34 600 000 000', // el del adulto: la regla de contacto se aplica a todos
    email: '',
    relationship: 'hijo', // valor provisional (lista por confirmar)
  }
}

function validBooking(): Booking {
  return {
    stay: {
      reference: 'RES-0001',
      checkInDate: '2027-07-12',
      checkInTime: '16:00',
      checkOutDate: '2027-07-19',
      checkOutTime: '11:00',
      numberOfPeople: 2,
    },
    people: [adult(), child()],
  }
}

describe('validateBooking', () => {
  it('una reserva correcta no tiene errores', () => {
    expect(validateBooking(validBooking(), TODAY)).toEqual([])
  })

  it('una reserva vacía marca los obligatorios', () => {
    const errors = validateBooking(emptyBooking(), TODAY)
    expect(errors).toContainEqual({ personIndex: null, field: 'reference', code: 'campo.obligatorio' })
    expect(errors).toContainEqual({ personIndex: 0, field: 'firstName', code: 'campo.obligatorio' })
    expect(errors).toContainEqual({ personIndex: 0, field: 'documentType', code: 'documento.obligatorio' })
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

  it('salida no posterior a la entrada', () => {
    const booking = validBooking()
    booking.stay.checkOutDate = '2027-07-12'
    booking.stay.checkOutTime = '16:00'
    expect(validateBooking(booking, TODAY)).toEqual([
      { personIndex: null, field: 'checkOutDate', code: 'salida.noPosterior' },
    ])
  })

  it('el número de personas debe coincidir con la lista', () => {
    const booking = validBooking()
    booking.stay.numberOfPeople = 3
    expect(validateBooking(booking, TODAY)).toEqual([
      { personIndex: null, field: 'numberOfPeople', code: 'reserva.personasNoCoinciden' },
    ])
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

  it('menor sin parentesco', () => {
    const booking = validBooking()
    booking.people[1]!.relationship = ''
    expect(validateBooking(booking, TODAY)).toEqual([
      { personIndex: 1, field: 'relationship', code: 'parentesco.obligatorio' },
    ])
  })

  it('cumple 18 el día de entrada: no necesita parentesco', () => {
    const booking = validBooking()
    booking.people[1] = { ...adult(), birthDate: '2009-07-12', relationship: '' }
    expect(validateBooking(booking, TODAY)).toEqual([])
  })

  it('documento obligatorio desde los 14 años, a la fecha de entrada', () => {
    const booking = validBooking()
    // Cumple 14 el día de entrada: ya debe llevar documento
    booking.people[1] = { ...child(), birthDate: '2013-07-12' }
    expect(validateBooking(booking, TODAY)).toEqual([
      { personIndex: 1, field: 'documentType', code: 'documento.obligatorio' },
    ])
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

  it('teléfono y correo: basta con uno de los dos', () => {
    const booking = validBooking()
    booking.people[0]!.phone = ''
    expect(validateBooking(booking, TODAY)).toEqual([])

    booking.people[0]!.phone = '+34 600 000 000'
    booking.people[0]!.email = ''
    expect(validateBooking(booking, TODAY)).toEqual([])
  })

  it('teléfono y correo: si faltan los dos, error de contacto', () => {
    const booking = validBooking()
    booking.people[0]!.phone = ''
    booking.people[0]!.email = ''
    expect(validateBooking(booking, TODAY)).toEqual([
      { personIndex: 0, field: 'contact', code: 'contacto.obligatorio' },
    ])
  })

  it('teléfono y correo: si se rellena uno, se comprueba su formato', () => {
    const booking = validBooking()
    booking.people[0]!.phone = ''
    booking.people[0]!.email = 'ana@'
    expect(validateBooking(booking, TODAY)).toEqual([
      { personIndex: 0, field: 'email', code: 'correo.formato' },
    ])
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
