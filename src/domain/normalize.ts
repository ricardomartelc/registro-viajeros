import type { Person, Stay } from './types'

// Limpia los espacios: quita los del principio y del final, y deja uno solo
// donde haya varios seguidos. '  Ana   María ' → 'Ana María'
export function cleanSpaces(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}

// Copia de la estancia con todos los textos limpios.
export function cleanStay(stay: Stay): Stay {
  return {
    ...stay,
    reference: cleanSpaces(stay.reference),
    checkInDate: cleanSpaces(stay.checkInDate),
    checkInTime: cleanSpaces(stay.checkInTime),
    checkOutDate: cleanSpaces(stay.checkOutDate),
    checkOutTime: cleanSpaces(stay.checkOutTime),
  }
}

// Copia de la persona con todos los textos limpios.
export function cleanPerson(person: Person): Person {
  return {
    ...person,
    firstName: cleanSpaces(person.firstName),
    surname1: cleanSpaces(person.surname1),
    surname2: cleanSpaces(person.surname2),
    birthDate: cleanSpaces(person.birthDate),
    nationality: cleanSpaces(person.nationality),
    documentNumber: cleanSpaces(person.documentNumber),
    supportNumber: cleanSpaces(person.supportNumber),
    phone: cleanSpaces(person.phone),
    email: cleanSpaces(person.email),
    relationship: cleanSpaces(person.relationship),
    address: {
      street: cleanSpaces(person.address.street),
      city: cleanSpaces(person.address.city),
      postalCode: cleanSpaces(person.address.postalCode),
      country: cleanSpaces(person.address.country),
    },
  }
}
