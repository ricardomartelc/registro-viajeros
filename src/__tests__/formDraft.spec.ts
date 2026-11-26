import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { clearFormFlags, loadFormFlags, saveFormFlags } from '../ui/guest/formDraft'

describe('Casillas del formulario (sessionStorage aparte)', () => {
  beforeEach(() => sessionStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('guarda y vuelve a leer las casillas', () => {
    saveFormFlags({ sameAddress: [null, false], sameContact: [null, true] })
    expect(loadFormFlags()).toEqual({ sameAddress: [null, false], sameContact: [null, true] })
  })

  it('sin casillas no guarda nada', () => {
    saveFormFlags({ sameAddress: [], sameContact: [] })
    expect(sessionStorage.length).toBe(0)
  })

  it('borrar y datos dañados', () => {
    saveFormFlags({ sameAddress: [null, false], sameContact: [] })
    clearFormFlags()
    expect(loadFormFlags()).toEqual({ sameAddress: [], sameContact: [] })
    sessionStorage.setItem('canvauma.borrador.formulario', '{roto')
    expect(loadFormFlags()).toEqual({ sameAddress: [], sameContact: [] })
  })

  it('modo privado: si sessionStorage falla, no rompe la web', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(saveFormFlags({ sameAddress: [true], sameContact: [] })).toBe(false)
    expect(loadFormFlags()).toEqual({ sameAddress: [], sameContact: [] })
  })
})
