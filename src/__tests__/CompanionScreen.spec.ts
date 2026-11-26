import { describe, it, expect, beforeEach } from 'vitest'

import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import CompanionScreen from '../ui/guest/CompanionScreen.vue'
import { booking, resetBooking, syncPeopleCount } from '../ui/guest/bookingState'

// Datos inventados.
function prepare(total: number) {
  Object.assign(booking.stay, { checkInDate: '2027-07-12', numberOfPeople: total })
  Object.assign(booking.people[0]!, {
    firstName: 'Ana',
    surname1: 'Ejemplo',
    phone: '+34 600 000 000',
    address: { street: 'Calle Inventada 1', city: 'Alcúdia', postalCode: '07400', country: 'ES' },
  })
  syncPeopleCount(total)
}

function fillCompanion(index: number, birthDate = '1990-01-01') {
  Object.assign(booking.people[index]!, {
    firstName: 'Leo',
    surname1: 'Ejemplo',
    sex: 'hombre',
    birthDate,
    nationality: 'ES',
    documentType: 'pasaporte',
    documentNumber: 'AB1234567',
  })
}

describe('Pantalla Acompañante', () => {
  beforeEach(() => {
    sessionStorage.clear()
    resetBooking()
  })

  it('título "Acompañante 2 de 3"', () => {
    prepare(3)
    const wrapper = mount(CompanionScreen, { props: { index: 1 }, attachTo: document.body })
    expect(wrapper.find('h1').text()).toBe('Acompañante 2 de 3')
    wrapper.unmount()
  })

  it('las casillas vienen marcadas: copian y ocultan domicilio y contacto', () => {
    prepare(2)
    const wrapper = mount(CompanionScreen, { props: { index: 1 }, attachTo: document.body })
    const boxes = wrapper.findAll('input[type="checkbox"]')
    expect(boxes).toHaveLength(2)
    expect((boxes[0]!.element as HTMLInputElement).checked).toBe(true)
    expect(wrapper.find('#campo-address-street').exists()).toBe(false)
    expect(wrapper.find('#campo-phone').exists()).toBe(false)
    expect(wrapper.text()).toContain('Calle Inventada 1')
    expect(booking.people[1]!.address.city).toBe('Alcúdia')
    wrapper.unmount()
  })

  it('al desmarcar aparecen los campos', async () => {
    prepare(2)
    const wrapper = mount(CompanionScreen, { props: { index: 1 }, attachTo: document.body })
    await wrapper.findAll('input[type="checkbox"]')[0]!.setValue(false)
    expect(wrapper.find('#campo-address-street').exists()).toBe(true)
    wrapper.unmount()
  })

  it('parentesco solo si es menor a la fecha de entrada', async () => {
    prepare(2)
    fillCompanion(1)
    const wrapper = mount(CompanionScreen, { props: { index: 1 }, attachTo: document.body })
    expect(wrapper.find('#campo-relationship').exists()).toBe(false)
    booking.people[1]!.birthDate = '2016-05-20'
    await nextTick()
    expect(wrapper.find('#campo-relationship').exists()).toBe(true)
    wrapper.unmount()
  })

  it('con errores no avanza', async () => {
    prepare(3)
    const wrapper = mount(CompanionScreen, { props: { index: 1 }, attachTo: document.body })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.summary').exists()).toBe(true)
    expect(wrapper.emitted('next')).toBeUndefined()
    wrapper.unmount()
  })

  it('correcto y no es el último: avanza', async () => {
    prepare(3)
    fillCompanion(1)
    const wrapper = mount(CompanionScreen, { props: { index: 1 }, attachTo: document.body })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('next')).toHaveLength(1)
    wrapper.unmount()
  })

  // Bloque 4: el último acompañante también avisa con 'next' (App.vue lleva a Revisar).
  it('correcto y es el último: también avanza (a Revisar)', async () => {
    prepare(2)
    fillCompanion(1)
    const wrapper = mount(CompanionScreen, { props: { index: 1 }, attachTo: document.body })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('next')).toHaveLength(1)
    wrapper.unmount()
  })
})
