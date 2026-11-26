import { emptyBooking, emptyPerson, emptyStay } from '../../domain/create'
import type { Booking, Person } from '../../domain/types'

// Guardado temporal del borrador en sessionStorage (no localStorage):
// se queda solo en esta pestaña del navegador y desaparece al cerrarla.
// Nunca se envía a ningún servidor.
// Todo va con try/catch: en algunos navegadores (modo privado, almacenamiento lleno)
// sessionStorage falla, y entonces la web sigue funcionando solo en memoria.
const KEY = 'canvauma.borrador'

// ¿Se puede guardar en este navegador? Prueba a escribir y borrar una clave.
export function storageWorks(): boolean {
  try {
    sessionStorage.setItem(`${KEY}.prueba`, '1')
    sessionStorage.removeItem(`${KEY}.prueba`)
    return true
  } catch {
    return false
  }
}

// Guarda el borrador. Si no hay nada escrito, no guarda nada (y borra lo anterior).
// Devuelve false si el navegador no deja guardar.
export function saveDraft(booking: Booking): boolean {
  try {
    if (JSON.stringify(booking) === JSON.stringify(emptyBooking())) {
      sessionStorage.removeItem(KEY)
    } else {
      sessionStorage.setItem(KEY, JSON.stringify(booking))
    }
    return true
  } catch {
    return false
  }
}

// Lee el borrador. Si no hay, está dañado o el navegador no deja leer, devuelve null.
// Rellena los campos que falten (por si el borrador es de una versión anterior de la web).
export function loadDraft(): Booking | null {
  try {
    const text = sessionStorage.getItem(KEY)
    if (!text) return null
    const data = JSON.parse(text) as Partial<Booking>
    const people = Array.isArray(data.people) && data.people.length ? data.people : [emptyPerson()]
    return {
      stay: { ...emptyStay(), ...data.stay },
      people: people.map((person: Partial<Person>) => ({
        ...emptyPerson(),
        ...person,
        address: { ...emptyPerson().address, ...person.address },
      })),
    }
  } catch {
    return null
  }
}

export function clearDraft(): void {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // Si no se puede, no había nada guardado.
  }
}
