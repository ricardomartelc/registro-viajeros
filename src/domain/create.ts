import type { Booking, Person, Stay } from './types'

// Funciones para crear datos vacíos (el punto de partida de los formularios).

export function emptyStay(): Stay {
  return {
    reference: '',
    checkInDate: '',
    checkInTime: '',
    checkOutDate: '',
    checkOutTime: '',
    numberOfPeople: 1,
  }
}

export function emptyPerson(): Person {
  return {
    firstName: '',
    surname1: '',
    surname2: '',
    sex: '',
    birthDate: '',
    nationality: '',
    documentType: '',
    documentNumber: '',
    supportNumber: '',
    address: { street: '', city: '', postalCode: '', country: '' },
    phone: '',
    email: '',
    relationship: '',
  }
}

export function emptyBooking(): Booking {
  return { stay: emptyStay(), people: [emptyPerson()] }
}
