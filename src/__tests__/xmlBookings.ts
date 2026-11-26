import { emptyPerson } from '../domain/create'
import type { Booking, Person } from '../domain/types'

// Reservas INVENTADAS para los tests del XML (el repositorio es público).

const ADDRESS = { street: 'Calle Inventada 1', city: 'Alcúdia', postalCode: '07400', country: 'ES' }

export function holder(): Person {
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
    address: { ...ADDRESS },
    phone: '+34 600 000 000',
    email: 'ana@ejemplo.test',
  }
}

// Reserva de 1 persona, en invierno (enero: +01:00), sin forma de pago.
export function oneGuestBooking(): Booking {
  return {
    stay: {
      reference: 'RES-0001',
      checkInDate: '2027-01-15',
      checkInTime: '16:00',
      checkOutDate: '2027-01-20',
      checkOutTime: '11:00',
      numberOfPeople: 1,
    },
    people: [holder()],
  }
}

// Reserva de 3 personas en verano (julio: +02:00), con pago y un menor sin documento.
export function threeGuestBooking(): Booking {
  return {
    stay: {
      reference: 'RES-0003',
      checkInDate: '2027-07-12',
      checkInTime: '16:00',
      checkOutDate: '2027-07-19',
      checkOutTime: '11:00',
      numberOfPeople: 3,
      payment: { method: 'tarjeta' },
    },
    people: [
      holder(),
      {
        ...emptyPerson(),
        firstName: 'Luis',
        surname1: 'Prueba',
        sex: 'hombre',
        birthDate: '1983-11-02',
        nationality: 'DE',
        documentType: 'pasaporte',
        documentNumber: 'C01X00T47',
        address: { ...ADDRESS }, // copiado del titular
        phone: '+34 600 000 000', // copiado del titular
      },
      {
        ...emptyPerson(),
        firstName: 'Leo',
        surname1: 'Prueba',
        sex: 'hombre',
        birthDate: '2016-05-20', // 11 años a la entrada: menor, sin documento
        nationality: 'FR',
        address: { ...ADDRESS },
        phone: '+34 600 000 000',
        relationship: 'Hijo',
      },
    ],
  }
}
