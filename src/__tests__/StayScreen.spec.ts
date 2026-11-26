import { describe, it, expect, beforeEach } from 'vitest'

import { mount } from '@vue/test-utils'
import StayScreen from '../ui/guest/StayScreen.vue'
import { booking, resetBooking } from '../ui/guest/bookingState'

// Datos inventados.
describe('Pantalla Estancia', () => {
  beforeEach(() => {
    sessionStorage.clear()
    resetBooking()
  })

  it('al pulsar Siguiente vacía: enseña los errores y no avanza', async () => {
    const wrapper = mount(StayScreen, { attachTo: document.body })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.summary').exists()).toBe(true)
    expect(wrapper.text()).toContain('Este dato es obligatorio.')
    expect(wrapper.emitted('next')).toBeUndefined()
    wrapper.unmount()
  })

  it('el error de un campo aparece al salir de él', async () => {
    const wrapper = mount(StayScreen, { attachTo: document.body })
    const reference = wrapper.find('#campo-reference')
    expect(wrapper.text()).not.toContain('Este dato es obligatorio.')
    await reference.trigger('focusout')
    expect(wrapper.text()).toContain('Este dato es obligatorio.')
    wrapper.unmount()
  })

  it('con datos correctos avanza', async () => {
    Object.assign(booking.stay, {
      reference: '  RES-0001 ',
      checkInDate: '2027-07-12',
      checkInTime: '16:00',
      checkOutDate: '2027-07-19',
      checkOutTime: '11:00',
      numberOfPeople: 2,
    })
    const wrapper = mount(StayScreen, { attachTo: document.body })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('next')).toHaveLength(1)
    expect(booking.stay.reference).toBe('RES-0001') // espacios limpiados
    wrapper.unmount()
  })

  it('la salida debe ser posterior a la entrada', async () => {
    Object.assign(booking.stay, {
      reference: 'RES-0001',
      checkInDate: '2027-07-12',
      checkInTime: '16:00',
      checkOutDate: '2027-07-12',
      checkOutTime: '16:00',
    })
    const wrapper = mount(StayScreen, { attachTo: document.body })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('La salida debe ser posterior a la entrada.')
    expect(wrapper.emitted('next')).toBeUndefined()
    wrapper.unmount()
  })
})
