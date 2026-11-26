// Modelo de datos del registro de viajeros. TypeScript puro, sin Vue.
//
// Fechas: texto 'AAAA-MM-DD'. Un campo vacío se guarda como texto vacío ''.
//
// Los códigos que usa el ministerio (países, sexo, tipo de documento) se traducen en
// src/xml/schema.ts. Aquí guardamos valores internos. El parentesco ya usa los códigos
// del documento de diseño (src/domain/relationships.ts).
//
// Datos fijos del propietario que el huésped NO rellena (se añaden al unir en el Bloque 6):
// horas de entrada y salida, forma de pago (siempre PLATF), código de establecimiento,
// número de habitaciones e internet.

export type DocumentType = 'dni' | 'nie' | 'pasaporte' | 'otro'

// Valores internos. En el XML: H, M, O (src/xml/schema.ts).
export type Sex = 'hombre' | 'mujer' | 'otro'

export interface Address {
  street: string
  complement: string // opcional: piso, puerta, escalera…
  // Municipio en texto. Si el país es España, se sustituirá por un buscador con
  // código INE cuando tengamos la lista (ver docs/pendiente-ministerio.md).
  city: string
  postalCode: string
  country: string // ISO alfa-2 interno ('ES'); en el XML, alfa-3 ('ESP')
}

export interface Person {
  firstName: string
  surname1: string
  surname2: string // obligatorio si el documento es DNI; si no, opcional
  sex: Sex | ''
  birthDate: string
  nationality: string // ISO alfa-2 interno; en el XML, alfa-3
  documentType: DocumentType | ''
  documentNumber: string
  supportNumber: string // número de soporte del DNI o NIE, cuando aplica
  address: Address
  phone: string // teléfono móvil (obligatorio)
  phone2: string // teléfono fijo (opcional)
  email: string // opcional, máximo 50 caracteres
  // Parentesco con un adulto de la reserva si es menor: código de src/domain/relationships.ts
  relationship: string
}

export interface Stay {
  reference: string
  contractDate: string // opcional: fecha del correo de confirmación de Airbnb
  checkInDate: string
  checkOutDate: string
  numberOfPeople: number
}

// Reserva completa: la estancia y la lista de personas.
export interface Booking {
  stay: Stay
  people: Person[]
}
