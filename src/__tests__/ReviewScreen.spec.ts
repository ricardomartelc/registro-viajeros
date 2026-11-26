import { describe, it, expect, beforeEach } from 'vitest'

import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ReviewScreen from '../ui/guest/ReviewScreen.vue'
import { booking, confirmed, resetBooking, reviewNav } from '../ui/guest/bookingState'
import { fillValidBooking } from './fixtures'

function mountReview() {
  return mount(ReviewScreen, { attachTo: document.body })
}

describe('Pantalla Revisar', () => {
  beforeEach(() => {
    sessionStorage.clear()
    resetBooking()
  })

  it('una tarjeta por bloque con los datos (fecha legible, campos opcionales vacíos ocultos)', () => {
    fillValidBooking(2)
    booking.people[0]!.email = '' // opcional vacío: no debe salir la fila
    const wrapper = mountReview()
    const titles = wrapper.findAll('section.summary h2').map((title) => title.text())
    expect(titles).toEqual(['Estancia', 'Titular de la reserva', 'Acompañante 2'])
    expect(wrapper.text()).toContain('12 de julio de 2027, 16:00')
    expect(wrapper.text()).toContain('Ana Ejemplo Prueba')
    expect(wrapper.text()).toContain('DNI 12345678Z')
    expect(wrapper.text()).toContain('Calle Inventada 1, 07400 Alcúdia, España')
    expect(wrapper.text()).not.toContain('Correo electrónico')
    wrapper.unmount()
  })

  it('sin errores: no hay resumen de errores y el botón no está desactivado', () => {
    fillValidBooking(1)
    const wrapper = mountReview()
    expect(wrapper.find('[aria-labelledby="resumen-errores-titulo"]').exists()).toBe(false)
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
    wrapper.unmount()
  })

  it('con errores: resumen con persona y campo, y "Continuar" desactivado con explicación', () => {
    fillValidBooking(2)
    booking.people[1]!.birthDate = ''
    const wrapper = mountReview()
    const links = wrapper.findAll('[aria-labelledby="resumen-errores-titulo"] a')
    expect(links.map((link) => link.text())).toContain(
      'Acompañante 2: Fecha de nacimiento: Este dato es obligatorio.',
    )
    const button = wrapper.find('button[type="submit"]')
    expect(button.attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Corrija los datos marcados para continuar.')
    expect(button.attributes('aria-describedby')).toBe('motivo-continuar')
    wrapper.unmount()
  })

  it('un domicilio copiado del titular con error se asocia al titular', () => {
    fillValidBooking(2)
    booking.people[0]!.address.city = '' // el acompañante lo copia (casilla marcada)
    const wrapper = mountReview()
    const texts = wrapper.findAll('[aria-labelledby="resumen-errores-titulo"] a').map((a) => a.text())
    expect(texts).toEqual(['Titular de la reserva: Localidad: Este dato es obligatorio.'])
    wrapper.unmount()
  })

  it('el enlace de un error lleva a su pantalla y campo, y activa la vuelta a Revisar', async () => {
    fillValidBooking(2)
    booking.people[1]!.birthDate = ''
    const wrapper = mountReview()
    await wrapper.find('[aria-labelledby="resumen-errores-titulo"] a').trigger('click')
    expect(wrapper.emitted('edit')![0]).toEqual([
      { screen: 'acompanantes', companion: 1, fieldId: 'campo-birthDate' },
    ])
    expect(reviewNav.returnToReview).toBe(true)
    expect(reviewNav.focusField).toBe('campo-birthDate')
    wrapper.unmount()
  })

  it('"Cambiar" tiene nombre accesible completo y activa la vuelta a Revisar', async () => {
    fillValidBooking(2)
    const wrapper = mountReview()
    const buttons = wrapper.findAll('.change')
    expect(buttons.map((button) => button.text().replace(/\s+/g, ' '))).toEqual([
      'Cambiar estancia',
      'Cambiar datos del titular',
      'Cambiar acompañante 2',
    ])
    await buttons[1]!.trigger('click')
    expect(wrapper.emitted('edit')![0]).toEqual([{ screen: 'datos' }])
    expect(reviewNav.returnToReview).toBe(true)
    expect(reviewNav.focusField).toBeNull()
    wrapper.unmount()
  })

  it('la casilla es obligatoria: sin marcarla no continúa y explica por qué', async () => {
    fillValidBooking(1)
    const wrapper = mountReview()
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.emitted('next')).toBeUndefined()
    expect(wrapper.text()).toContain('Marque la casilla para continuar.')
    expect(document.activeElement?.id).toBe('confirmar-datos')

    await wrapper.find('#confirmar-datos').setValue(true)
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('next')).toHaveLength(1)
    expect(confirmed.value).toBe(true)
    wrapper.unmount()
  })
})
