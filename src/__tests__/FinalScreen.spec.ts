import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { flushPromises, mount } from '@vue/test-utils'
import FinalScreen from '../ui/guest/FinalScreen.vue'
import { booking, dataCleared, resetBooking } from '../ui/guest/bookingState'
import { RECEPTION_EMAIL } from '../config'
import { fillValidBooking } from './fixtures'

function mountFinal() {
  return mount(FinalScreen, { attachTo: document.body })
}

describe('Pantalla Final', () => {
  beforeEach(() => {
    sessionStorage.clear()
    resetBooking()
    fillValidBooking(1)
  })
  afterEach(() => vi.unstubAllGlobals())

  // Bloque 5A: "Descargar archivo" ya funciona (antes estaba desactivado).
  it('tres pasos numerados; descargar está activo', () => {
    const wrapper = mountFinal()
    expect(wrapper.find('h1').text()).toBe('Casi listo')
    const titles = wrapper.findAll('.step__title').map((title) => title.text())
    expect(titles).toEqual([
      'Paso 1: Descargue su archivo',
      'Paso 2: Envíelo por correo',
      'Paso 3: Borre sus datos del móvil',
    ])
    const download = wrapper.findAll('.step__button')[0]!
    expect(download.attributes('disabled')).toBeUndefined()
    expect(wrapper.text()).not.toContain('Disponible muy pronto.')
    expect(wrapper.text()).toContain('Sus datos no se guardan en ningún servidor.')
    wrapper.unmount()
  })

  it('muestra la dirección de envío y el localizador', () => {
    const wrapper = mountFinal()
    expect(wrapper.text()).toContain(RECEPTION_EMAIL)
    expect(wrapper.text()).toContain('RES-0001')
    wrapper.unmount()
  })

  it('copiar con portapapeles: copia la dirección y lo confirma', async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })
    const wrapper = mountFinal()
    await wrapper.findAll('.step__button')[1]!.trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith(RECEPTION_EMAIL)
    expect(wrapper.text()).toContain('Dirección copiada.')
    wrapper.unmount()
  })

  it('copiar sin portapapeles: enseña la dirección en un campo seleccionable', async () => {
    vi.stubGlobal('navigator', { ...navigator, clipboard: undefined })
    const wrapper = mountFinal()
    await wrapper.findAll('.step__button')[1]!.trigger('click')
    await flushPromises()
    const input = wrapper.find('#direccion-correo')
    expect(input.exists()).toBe(true)
    expect((input.element as HTMLInputElement).value).toBe(RECEPTION_EMAIL)
    expect(document.activeElement).toBe(input.element)
    wrapper.unmount()
  })

  it('si el portapapeles falla, también hay alternativa', async () => {
    const writeText = vi
      .fn<(text: string) => Promise<void>>()
      .mockRejectedValue(new Error('NotAllowedError'))
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })
    const wrapper = mountFinal()
    await wrapper.findAll('.step__button')[1]!.trigger('click')
    await flushPromises()
    expect(wrapper.find('#direccion-correo').exists()).toBe(true)
    wrapper.unmount()
  })

  it('borrar datos: pide confirmación, borra y avisa para volver a la bienvenida', async () => {
    const wrapper = mountFinal()
    await wrapper.findAll('.step__button')[2]!.trigger('click')
    expect(wrapper.text()).toContain('¿Borrar todo lo que ha escrito?')
    expect(booking.stay.reference).toBe('RES-0001') // todavía no se ha borrado

    await wrapper.find('.confirm__yes').trigger('click')
    expect(booking.stay.reference).toBe('')
    expect(booking.people[0]!.firstName).toBe('')
    expect(dataCleared.value).toBe(true)
    expect(wrapper.emitted('cleared')).toHaveLength(1)
    wrapper.unmount()
  })

  it('cancelar el borrado no borra nada', async () => {
    const wrapper = mountFinal()
    await wrapper.findAll('.step__button')[2]!.trigger('click')
    await wrapper.find('.confirm__no').trigger('click')
    expect(booking.stay.reference).toBe('RES-0001')
    expect(wrapper.emitted('cleared')).toBeUndefined()
    wrapper.unmount()
  })
})
