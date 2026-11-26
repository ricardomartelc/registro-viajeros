// Modelo de datos del registro de viajeros. TypeScript puro, sin Vue.
//
// Fechas: texto 'AAAA-MM-DD' (lo que devuelve <input type="date">).
// Horas: texto 'HH:MM' (lo que devuelve <input type="time">).
// Un campo vacío se guarda como texto vacío ''.
//
// Los códigos que usa el ministerio (países, sexo, tipo de documento, parentesco)
// se traducirán en src/xml. Aquí guardamos valores internos.

export type DocumentType = 'dni' | 'nie' | 'pasaporte' | 'otro'

// Valores internos. Códigos del ministerio por confirmar con la plantilla del ministerio.
export type Sex = 'hombre' | 'mujer' | 'otro'

export interface Address {
  street: string
  city: string
  postalCode: string
  // Código de país. Formato (ISO alfa-2 'ES' o alfa-3 'ESP') por confirmar con la plantilla del ministerio.
  country: string
}

export interface Person {
  firstName: string
  surname1: string
  surname2: string // opcional
  sex: Sex | ''
  birthDate: string
  // Código de país, mismo formato que Address.country (por confirmar con la plantilla del ministerio).
  nationality: string
  documentType: DocumentType | ''
  documentNumber: string
  supportNumber: string // número de soporte del DNI o NIE, cuando aplica
  address: Address
  phone: string
  email: string
  // Parentesco con un adulto de la reserva si es menor.
  // Lista de valores por confirmar con la plantilla del ministerio.
  relationship: string
}

// Datos de pago. Opcionales y sin validar: por confirmar con la plantilla del ministerio.
export interface Payment {
  method: string
  date?: string
  holder?: string
}

export interface Stay {
  reference: string
  checkInDate: string
  checkInTime: string
  checkOutDate: string
  checkOutTime: string
  numberOfPeople: number
  payment?: Payment
}

// Reserva completa: la estancia y la lista de personas.
export interface Booking {
  stay: Stay
  people: Person[]
}
