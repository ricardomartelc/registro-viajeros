import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import App from '../App.vue'
import { vReveal } from '../ui/shared/vReveal'
import {
  booking,
  clampCompanion,
  resetBooking,
  syncPeopleCount,
} from '../ui/guest/bookingState'

// Datos inventados.
function prepare(total: number) {
  Object.assign(booking.stay, { checkInDate: '2027-07-12', numberOfPeople: total })
  Object.assign(booking.people[0]!, {
    phone: '+34 600 000 000',
    address: { street: 'Calle Inventada 1', city: 'Alcúdia', postalCode: '07400', country: 'ES' },
  })
  syncPeopleCount(total)
}

function fillCompanion(index: number) {
  Object.assign(booking.people[index]!, {
    firstName: 'Leo',
    surname1: 'Ejemplo',
    sex: 'hombre',
    birthDate: '1990-01-01',
    nationality: 'ES',
    documentType: 'pasaporte',
    documentNumber: 'AB1234567',
  })
}

function mountApp() {
  return mount(App, { global: { directives: { reveal: vReveal } }, attachTo: document.body })
}

describe('App: acompañantes', () => {
  beforeEach(() => {
    sessionStorage.clear()
    resetBooking()
  })
  afterEach(() => history.replaceState(null, '', '/'))

  it('clampCompanion: nunca menos de 1 ni más que el último acompañante', () => {
    syncPeopleCount(3) // titular + 2 acompañantes (posiciones 1 y 2)
    expect(clampCompanion(0)).toBe(1)
    expect(clampCompanion(2)).toBe(2)
    expect(clampCompanion(9)).toBe(2)
  })

  it('un número de acompañante que no existe se corrige al último', () => {
    prepare(3)
    history.replaceState({ companion: 9 }, '', '#acompanantes')
    const wrapper = mountApp()
    expect(wrapper.find('h1').text()).toBe('Acompañante 3 de 3')
    wrapper.unmount()
  })

  it('sin acompañantes, #acompanantes lleva a Datos', () => {
    prepare(1)
    history.replaceState(null, '', '#acompanantes')
    const wrapper = mountApp()
    expect(wrapper.find('h1').text()).toBe('Sus datos')
    expect(location.hash).toBe('#datos')
    wrapper.unmount()
  })

  // Bloque 4: desde el último acompañante se va a Revisar (nunca a un acompañante inexistente).
  it('desde el último acompañante, "Siguiente" lleva a Revisar', async () => {
    prepare(2)
    fillCompanion(1)
    history.replaceState({ companion: 1 }, '', '#acompanantes')
    const wrapper = mountApp()
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(location.hash).toBe('#revisar')
    expect(wrapper.find('h1').text()).toBe('Revise sus datos')
    wrapper.unmount()
  })

  it('desde un acompañante que no es el último, "Siguiente" pasa al siguiente', async () => {
    prepare(3)
    fillCompanion(1)
    history.replaceState({ companion: 1 }, '', '#acompanantes')
    const wrapper = mountApp()
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.find('h1').text()).toBe('Acompañante 3 de 3')
    expect(history.state?.companion).toBe(2)
    wrapper.unmount()
  })
})
