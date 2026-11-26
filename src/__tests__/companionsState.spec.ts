import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'

import {
  applySharedData,
  booking,
  companionsWithData,
  ensurePeopleCount,
  resetBooking,
  sameAddressFor,
  setSameAddress,
  setSameContact,
  syncPeopleCount,
} from '../ui/guest/bookingState'
import { loadFormFlags } from '../ui/guest/formDraft'

// Datos inventados.
function fillHolderContactAndAddress() {
  Object.assign(booking.people[0]!, {
    phone: '+34 600 000 000',
    email: 'ana@ejemplo.test',
    address: { street: 'Calle Inventada 1', complement: '', city: 'Alcúdia', postalCode: '07400', country: 'ES' },
  })
}

describe('Acompañantes en el estado de la reserva', () => {
  beforeEach(() => {
    sessionStorage.clear()
    resetBooking()
  })

  it('syncPeopleCount ajusta la lista (nunca menos de 1: el titular)', () => {
    syncPeopleCount(3)
    expect(booking.people).toHaveLength(3)
    syncPeopleCount(1)
    expect(booking.people).toHaveLength(1)
    syncPeopleCount(0)
    expect(booking.people).toHaveLength(1)
  })

  it('ensurePeopleCount solo añade, nunca borra', () => {
    booking.stay.numberOfPeople = 3
    ensurePeopleCount()
    expect(booking.people).toHaveLength(3)
    booking.stay.numberOfPeople = 2
    ensurePeopleCount()
    expect(booking.people).toHaveLength(3)
  })

  it('companionsWithData: solo cuenta lo escrito, no lo copiado del titular', () => {
    fillHolderContactAndAddress()
    syncPeopleCount(3)
    applySharedData() // copia domicilio y contacto a los dos acompañantes
    expect(companionsWithData(1)).toEqual([])

    booking.people[2]!.firstName = 'Leo'
    expect(companionsWithData(2)).toEqual([2])
    expect(companionsWithData(1)).toEqual([2])
  })

  it('las casillas están marcadas por defecto y copian domicilio y contacto', () => {
    fillHolderContactAndAddress()
    syncPeopleCount(2)
    expect(sameAddressFor(1)).toBe(true)
    applySharedData()
    expect(booking.people[1]!.address.city).toBe('Alcúdia')
    expect(booking.people[1]!.phone).toBe('+34 600 000 000')
  })

  it('desmarcada, no se copia ni se sobrescribe', () => {
    fillHolderContactAndAddress()
    syncPeopleCount(2)
    setSameAddress(1, false)
    setSameContact(1, false)
    booking.people[1]!.address.city = 'Palma'
    applySharedData()
    expect(booking.people[1]!.address.city).toBe('Palma')
    expect(booking.people[1]!.phone).toBe('')
  })

  it('las casillas se guardan aparte del borrador de la reserva', async () => {
    syncPeopleCount(2)
    setSameAddress(1, false)
    await nextTick()
    expect(loadFormFlags().sameAddress[1]).toBe(false)
  })

  it('"Borrar mis datos" también borra las casillas', async () => {
    syncPeopleCount(2)
    setSameAddress(1, false)
    resetBooking()
    await nextTick()
    expect(sameAddressFor(1)).toBe(true)
    expect(sessionStorage.getItem('canvauma.borrador.formulario')).toBeNull()
  })
})
