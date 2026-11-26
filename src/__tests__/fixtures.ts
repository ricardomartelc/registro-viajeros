import { booking, syncPeopleCount } from '../ui/guest/bookingState'

// Reserva válida con datos INVENTADOS para los tests (el repositorio es público).
// total = número de personas (titular + acompañantes). Los acompañantes usan el
// domicilio y el contacto del titular (casillas marcadas por defecto).
export function fillValidBooking(total: number): void {
  Object.assign(booking.stay, {
    reference: 'RES-0001',
    checkInDate: '2027-07-12',
    checkOutDate: '2027-07-19',
    numberOfPeople: total,
  })
  Object.assign(booking.people[0]!, {
    firstName: 'Ana',
    surname1: 'Ejemplo',
    surname2: 'Prueba',
    sex: 'mujer',
    birthDate: '1985-03-10',
    nationality: 'ES',
    documentType: 'dni',
    documentNumber: '12345678Z',
    supportNumber: 'AAA000000',
    address: { street: 'Calle Inventada 1', complement: '', city: 'Alcúdia', postalCode: '07400', country: 'ES' },
    phone: '+34 600 000 000',
    email: 'ana@ejemplo.test',
  })
  syncPeopleCount(total)
  for (let index = 1; index < total; index++) {
    Object.assign(booking.people[index]!, {
      firstName: 'Leo',
      surname1: 'Ejemplo',
      sex: 'hombre',
      birthDate: '1990-01-01',
      nationality: 'DE',
      documentType: 'pasaporte',
      documentNumber: `C0${index}X00T47`,
    })
  }
}
