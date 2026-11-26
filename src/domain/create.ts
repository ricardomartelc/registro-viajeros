import type { Booking, Person, Stay } from './types'

// Funciones para crear datos vacíos (el punto de partida de los formularios).

export function emptyStay(): Stay {
  return {
    reference: '',
    contractDate: '',
    checkInDate: '',
    checkOutDate: '',
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
    address: { street: '', complement: '', city: '', postalCode: '', country: '' },
    phone: '',
    phone2: '',
    email: '',
    relationship: '',
  }
}

export function emptyBooking(): Booking {
  return { stay: emptyStay(), people: [emptyPerson()] }
}
