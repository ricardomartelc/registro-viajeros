import { describe, it, expect, beforeEach } from 'vitest'

import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import HolderScreen from '../ui/guest/HolderScreen.vue'
import { booking, resetBooking } from '../ui/guest/bookingState'

// Datos inventados.
function fillAdult() {
  Object.assign(booking.stay, { checkInDate: '2027-07-12' })
  Object.assign(booking.people[0]!, {
    firstName: 'Ana',
    surname1: 'Ejemplo',
    sex: 'mujer',
    birthDate: '1985-03-10',
    nationality: 'ES',
    documentType: 'dni',
    documentNumber: '12345678Z',
    supportNumber: 'AAA000000',
    address: { street: 'Calle Inventada 1', city: 'Alcúdia', postalCode: '07400', country: 'ES' },
    phone: '+34 600 000 000',
  })
}

describe('Pantalla Datos del titular', () => {
  beforeEach(() => {
    sessionStorage.clear()
    resetBooking()
  })

  it('vacía: al pulsar Siguiente enseña los errores y no avanza', async () => {
    const wrapper = mount(HolderScreen, { attachTo: document.body })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.summary').exists()).toBe(true)
    expect(wrapper.emitted('next')).toBeUndefined()
    wrapper.unmount()
  })

  it('con datos correctos avanza', async () => {
    fillAdult()
    const wrapper = mount(HolderScreen, { attachTo: document.body })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('next')).toHaveLength(1)
    wrapper.unmount()
  })

  it('el número de soporte solo aparece si el documento lo exige', async () => {
    fillAdult()
    const wrapper = mount(HolderScreen, { attachTo: document.body })
    expect(wrapper.find('#campo-supportNumber').exists()).toBe(true)

    booking.people[0]!.documentType = 'pasaporte'
    await nextTick()
    expect(wrapper.find('#campo-supportNumber').exists()).toBe(false)
    expect(booking.people[0]!.supportNumber).toBe('') // se vacía al dejar de pedirse
    wrapper.unmount()
  })

  it('el parentesco solo aparece si es menor a la fecha de entrada', async () => {
    fillAdult()
    const wrapper = mount(HolderScreen, { attachTo: document.body })
    expect(wrapper.find('#campo-relationship').exists()).toBe(false)

    booking.people[0]!.birthDate = '2015-01-15'
    await nextTick()
    expect(wrapper.find('#campo-relationship').exists()).toBe(true)
    wrapper.unmount()
  })

  it('sin teléfono ni correo pide al menos uno', async () => {
    fillAdult()
    booking.people[0]!.phone = ''
    const wrapper = mount(HolderScreen, { attachTo: document.body })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('Indique al menos un teléfono o un correo.')
    expect(wrapper.emitted('next')).toBeUndefined()
    wrapper.unmount()
  })
})
