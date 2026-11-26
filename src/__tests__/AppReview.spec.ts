import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { flushPromises, mount } from '@vue/test-utils'
import App from '../App.vue'
import { vReveal } from '../ui/shared/vReveal'
import { booking, confirmed, dataCleared, resetBooking, reviewNav } from '../ui/guest/bookingState'
import { fillValidBooking } from './fixtures'

function mountApp() {
  return mount(App, { global: { directives: { reveal: vReveal } }, attachTo: document.body })
}

const title = (wrapper: ReturnType<typeof mountApp>) => wrapper.find('h1').text()

describe('App: Revisar y Final', () => {
  beforeEach(() => {
    sessionStorage.clear()
    resetBooking()
    dataCleared.value = false
  })
  afterEach(() => history.replaceState(null, '', '/'))

  it('Datos con una sola persona: "Siguiente" lleva a Revisar', async () => {
    fillValidBooking(1)
    history.replaceState(null, '', '#datos')
    const wrapper = mountApp()
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(location.hash).toBe('#revisar')
    expect(title(wrapper)).toBe('Revise sus datos')
    expect(document.activeElement?.tagName).toBe('H1')
    wrapper.unmount()
  })

  it('"Cambiar estancia" y "Siguiente" vuelven directamente a Revisar', async () => {
    fillValidBooking(2)
    history.replaceState(null, '', '#revisar')
    const wrapper = mountApp()
    await wrapper.findAll('.change')[0]!.trigger('click')
    await flushPromises()
    expect(location.hash).toBe('#estancia')
    expect(reviewNav.returnToReview).toBe(true)

    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(location.hash).toBe('#revisar')
    expect(reviewNav.returnToReview).toBe(false) // la marca se borra al volver
    wrapper.unmount()
  })

  it('un error de Revisar lleva al campo del acompañante, con sus errores a la vista', async () => {
    fillValidBooking(2)
    booking.people[1]!.firstName = ''
    history.replaceState(null, '', '#revisar')
    const wrapper = mountApp()
    await wrapper.find('[aria-labelledby="resumen-errores-titulo"] a').trigger('click')
    await flushPromises()
    expect(location.hash).toBe('#acompanantes')
    expect(document.activeElement?.id).toBe('campo-firstName')
    expect(wrapper.text()).toContain('Este dato es obligatorio.')
    wrapper.unmount()
  })

  it('"Atrás" en Revisar vuelve al último acompañante', async () => {
    fillValidBooking(3)
    history.replaceState(null, '', '#revisar')
    const wrapper = mountApp()
    const back = wrapper.findAll('.actions__button')[1]!
    await back.trigger('click')
    await flushPromises()
    expect(title(wrapper)).toBe('Acompañante 3 de 3')
    wrapper.unmount()
  })

  it('el "atrás" del navegador vuelve de Final a Revisar', async () => {
    fillValidBooking(1)
    history.replaceState(null, '', '#revisar')
    const wrapper = mountApp()
    await wrapper.find('#confirmar-datos').setValue(true)
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(location.hash).toBe('#final')

    history.back()
    await new Promise((resolve) => window.addEventListener('popstate', resolve, { once: true }))
    await flushPromises()
    expect(title(wrapper)).toBe('Revise sus datos')
    wrapper.unmount()
  })

  it('entrar a mano en #revisar sin estancia válida lleva a Estancia', () => {
    history.replaceState(null, '', '#revisar')
    const wrapper = mountApp()
    expect(location.hash).toBe('#estancia')
    expect(title(wrapper)).toBe('Su estancia')
    wrapper.unmount()
  })

  it('entrar a mano en #revisar con el titular sin rellenar lleva a Datos', () => {
    fillValidBooking(1)
    booking.people[0]!.firstName = ''
    history.replaceState(null, '', '#revisar')
    const wrapper = mountApp()
    expect(location.hash).toBe('#datos')
    wrapper.unmount()
  })

  it('entrar a mano en #final sin confirmar en Revisar lleva a Revisar', () => {
    fillValidBooking(1)
    confirmed.value = false
    history.replaceState(null, '', '#final')
    const wrapper = mountApp()
    expect(location.hash).toBe('#revisar')
    wrapper.unmount()
  })

  it('borrar en Final vuelve a la bienvenida con el aviso', async () => {
    fillValidBooking(1)
    confirmed.value = true
    history.replaceState(null, '', '#final')
    const wrapper = mountApp()
    await wrapper.findAll('.step__button')[2]!.trigger('click')
    await wrapper.find('.confirm__yes').trigger('click')
    await flushPromises()
    expect(location.hash).toBe('')
    expect(wrapper.text()).toContain('Sus datos se han borrado.')
    wrapper.unmount()
  })
})
