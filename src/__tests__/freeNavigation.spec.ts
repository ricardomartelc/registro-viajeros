import { describe, it, expect } from 'vitest'

import { FREE_NAVIGATION, freeNavigation } from '../config'

describe('Modo pruebas: navegación libre', () => {
  it('activado con npm run dev', () => {
    expect(freeNavigation({ DEV: true, MODE: 'development' })).toBe(true)
  })

  it('apagado en la versión final (npm run build)', () => {
    expect(freeNavigation({ DEV: false, MODE: 'production' })).toBe(false)
  })

  it('se puede apagar en desarrollo con VITE_NAVEGACION_LIBRE=false', () => {
    expect(
      freeNavigation({ DEV: true, MODE: 'development', VITE_NAVEGACION_LIBRE: 'false' }),
    ).toBe(false)
  })

  it('apagado en los tests (comprueban el comportamiento real)', () => {
    expect(FREE_NAVIGATION).toBe(false)
  })
})
