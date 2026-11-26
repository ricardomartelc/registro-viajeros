import { describe, it, expect, beforeEach } from 'vitest'

import { mount } from '@vue/test-utils'
import StayScreen from '../ui/guest/StayScreen.vue'
import { booking, resetBooking, syncPeopleCount } from '../ui/guest/bookingState'

// Datos inventados.
function validStay(numberOfPeople: number) {
  Object.assign(booking.stay, {
    reference: 'RES-0001',
    checkInDate: '2027-07-12',
    checkInTime: '16:00',
    checkOutDate: '2027-07-19',
    checkOutTime: '11:00',
    numberOfPeople,
  })
}

describe('Estancia: cambiar el número de personas', () => {
  beforeEach(() => {
    sessionStorage.clear()
    resetBooking()
  })

  it('al subir el número se crean los acompañantes', async () => {
    validStay(3)
    const wrapper = mount(StayScreen, { attachTo: document.body })
    await wrapper.find('form').trigger('submit')
    expect(booking.people).toHaveLength(3)
    expect(wrapper.emitted('next')).toHaveLength(1)
    wrapper.unmount()
  })

  it('al bajar sin datos escritos, se quitan sin preguntar', async () => {
    syncPeopleCount(3)
    validStay(1)
    const wrapper = mount(StayScreen, { attachTo: document.body })
    await wrapper.find('form').trigger('submit')
    expect(booking.people).toHaveLength(1)
    expect(wrapper.emitted('next')).toHaveLength(1)
    wrapper.unmount()
  })

  it('al bajar con datos escritos, pide confirmación en la página', async () => {
    syncPeopleCount(3)
    booking.people[2]!.firstName = 'Leo'
    validStay(2)
    const wrapper = mount(StayScreen, { attachTo: document.body })
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('.remove').exists()).toBe(true)
    expect(wrapper.find('.remove').text()).toContain('Acompañante 3 (Leo)')
    expect(booking.people).toHaveLength(3) // todavía no se ha borrado nada
    expect(wrapper.emitted('next')).toBeUndefined()

    await wrapper.find('.remove__confirm').trigger('click')
    expect(booking.people).toHaveLength(2)
    expect(wrapper.emitted('next')).toHaveLength(1)
    wrapper.unmount()
  })

  it('si cancela, no se borra nada', async () => {
    syncPeopleCount(3)
    booking.people[2]!.firstName = 'Leo'
    validStay(2)
    const wrapper = mount(StayScreen, { attachTo: document.body })
    await wrapper.find('form').trigger('submit')
    await wrapper.find('.remove__cancel').trigger('click')
    expect(wrapper.find('.remove').exists()).toBe(false)
    expect(booking.people).toHaveLength(3)
    expect(booking.people[2]!.firstName).toBe('Leo')
    wrapper.unmount()
  })
})
