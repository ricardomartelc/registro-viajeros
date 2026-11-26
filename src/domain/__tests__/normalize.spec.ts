import { describe, it, expect } from 'vitest'

import { cleanPerson, cleanSpaces, cleanStay } from '../normalize'
import { emptyPerson, emptyStay } from '../create'

describe('Limpieza de espacios', () => {
  it('quita espacios al principio, al final y dobles', () => {
    expect(cleanSpaces('  Ana   María  ')).toBe('Ana María')
    expect(cleanSpaces('Ana\tMaría')).toBe('Ana María')
    expect(cleanSpaces('   ')).toBe('')
  })

  it('limpia todos los textos de una persona, también el domicilio', () => {
    const person = {
      ...emptyPerson(),
      firstName: ' Ana ',
      address: { street: 'Calle  Inventada  1', city: ' Alcúdia', postalCode: '07400 ', country: 'ES' },
    }
    const clean = cleanPerson(person)
    expect(clean.firstName).toBe('Ana')
    expect(clean.address.street).toBe('Calle Inventada 1')
    expect(clean.address.city).toBe('Alcúdia')
    expect(clean.address.postalCode).toBe('07400')
  })

  it('limpia la estancia sin tocar el número de personas', () => {
    const clean = cleanStay({ ...emptyStay(), reference: ' RES  01 ', numberOfPeople: 3 })
    expect(clean.reference).toBe('RES 01')
    expect(clean.numberOfPeople).toBe(3)
  })
})
