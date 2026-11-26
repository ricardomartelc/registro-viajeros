import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { clearDraft, loadDraft, saveDraft, storageWorks } from '../ui/guest/draft'
import { emptyBooking } from '../domain/create'

// Datos inventados.
function bookingWithData() {
  const booking = emptyBooking()
  booking.stay.reference = 'RES-0001'
  booking.people[0]!.firstName = 'Ana'
  return booking
}

describe('Guardado temporal (sessionStorage)', () => {
  beforeEach(() => sessionStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('guarda y vuelve a leer el borrador', () => {
    expect(saveDraft(bookingWithData())).toBe(true)
    const loaded = loadDraft()
    expect(loaded?.stay.reference).toBe('RES-0001')
    expect(loaded?.people[0]?.firstName).toBe('Ana')
  })

  it('usa sessionStorage, no localStorage', () => {
    saveDraft(bookingWithData())
    expect(sessionStorage.length).toBe(1)
    expect(localStorage.length).toBe(0)
  })

  it('si no hay nada escrito, no guarda nada', () => {
    saveDraft(bookingWithData())
    saveDraft(emptyBooking())
    expect(sessionStorage.length).toBe(0)
  })

  it('"Borrar mis datos" elimina el borrador', () => {
    saveDraft(bookingWithData())
    clearDraft()
    expect(loadDraft()).toBeNull()
  })

  it('un borrador dañado se ignora', () => {
    sessionStorage.setItem('canvauma.borrador', '{esto no es JSON')
    expect(loadDraft()).toBeNull()
  })

  it('completa los campos que falten en un borrador antiguo', () => {
    sessionStorage.setItem(
      'canvauma.borrador',
      JSON.stringify({ stay: { reference: 'RES-0002' }, people: [{ firstName: 'Leo' }] }),
    )
    const loaded = loadDraft()!
    expect(loaded.stay.checkInDate).toBe('')
    expect(loaded.people[0]!.firstName).toBe('Leo')
    expect(loaded.people[0]!.address.city).toBe('')
  })

  it('modo privado: si sessionStorage falla, no rompe la web', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(storageWorks()).toBe(false)
    expect(saveDraft(bookingWithData())).toBe(false)
    expect(loadDraft()).toBeNull()
    expect(() => clearDraft()).not.toThrow()
  })
})
