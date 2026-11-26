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
      checkOutDate: '2027-07-19',
      numberOfPeople: 2,
    })
    const wrapper = mount(StayScreen, { attachTo: document.body })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('next')).toHaveLength(1)
    expect(booking.stay.reference).toBe('RES-0001') // espacios limpiados
    wrapper.unmount()
  })

  it('la fecha de salida debe ser posterior a la de entrada', async () => {
    Object.assign(booking.stay, {
      reference: 'RES-0001',
      checkInDate: '2027-07-12',
      checkOutDate: '2027-07-12',
    })
    const wrapper = mount(StayScreen, { attachTo: document.body })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('La fecha de salida debe ser posterior a la de entrada.')
    expect(wrapper.emitted('next')).toBeUndefined()
    wrapper.unmount()
  })

  it('sin horas ni forma de pago; con fecha del contrato opcional y aviso de menores', () => {
    const wrapper = mount(StayScreen, { attachTo: document.body })
    expect(wrapper.find('input[type="time"]').exists()).toBe(false)
    expect(wrapper.find('#campo-payment').exists()).toBe(false)
    expect(wrapper.find('#campo-contractDate').exists()).toBe(true)
    expect(wrapper.text()).toContain('Fecha del contrato (opcional)')
    expect(wrapper.text()).toContain('Fecha del correo de confirmación de Airbnb.')
    expect(wrapper.text()).toContain('le pediremos su parentesco')
    wrapper.unmount()
  })

  it('como máximo 6 personas, con error claro', async () => {
    Object.assign(booking.stay, {
      reference: 'RES-0001',
      checkInDate: '2027-07-12',
      checkOutDate: '2027-07-19',
      numberOfPeople: 7,
    })
    const wrapper = mount(StayScreen, { attachTo: document.body })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('Como máximo pueden alojarse 6 personas.')
    expect(wrapper.emitted('next')).toBeUndefined()
    wrapper.unmount()
  })
})
