import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { mount } from '@vue/test-utils'
import FinalScreen from '../ui/guest/FinalScreen.vue'
import { booking, resetBooking } from '../ui/guest/bookingState'
import { fillValidBooking } from './fixtures'

describe('Pantalla Final: descargar el archivo', () => {
  let createObjectURL: ReturnType<typeof vi.fn<(blob: Blob) => string>>
  let revokeObjectURL: ReturnType<typeof vi.fn<(url: string) => void>>
  let clickedLinks: HTMLAnchorElement[]

  beforeEach(() => {
    sessionStorage.clear()
    resetBooking()
    fillValidBooking(2)
    vi.useFakeTimers()
    // jsdom no trae URL.createObjectURL: se simula
    createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:prueba')
    revokeObjectURL = vi.fn<(url: string) => void>()
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL
    clickedLinks = []
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clickedLinks.push(this)
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('descarga parte_<localizador>.xml con un enlace temporal y avisa', async () => {
    const wrapper = mount(FinalScreen, { attachTo: document.body })
    await wrapper.find('.download-button').trigger('click')

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    const blob = createObjectURL.mock.calls[0]![0]
    expect(blob.type).toContain('application/xml')
    expect(clickedLinks).toHaveLength(1)
    expect(clickedLinks[0]!.download).toBe('parte_RES-0001.xml')
    expect(document.querySelector('a[download]')).toBeNull() // el enlace temporal ya no está
    expect(wrapper.find('[role="status"]').text()).toBe('Archivo descargado.')

    // La dirección temporal se libera después
    expect(revokeObjectURL).not.toHaveBeenCalled()
    vi.runAllTimers()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:prueba')
    wrapper.unmount()
  })

  it('no guarda el archivo en ningún sitio', async () => {
    const wrapper = mount(FinalScreen, { attachTo: document.body })
    const before = { session: sessionStorage.length, local: localStorage.length }
    await wrapper.find('.download-button').trigger('click')
    const allStored = [
      ...Object.keys(sessionStorage).map((key) => sessionStorage.getItem(key) ?? ''),
      ...Object.keys(localStorage).map((key) => localStorage.getItem(key) ?? ''),
    ].join('')
    expect(allStored).not.toContain('<?xml')
    expect(localStorage.length).toBe(before.local)
    wrapper.unmount()
  })

  it('si no se puede generar: error en texto, sin datos personales, y opción de volver a Revisar', async () => {
    booking.people[1]!.firstName = '' // falta un dato obligatorio
    const wrapper = mount(FinalScreen, { attachTo: document.body })
    await wrapper.find('.download-button').trigger('click')
    const error = wrapper.find('.file-error')
    expect(error.exists()).toBe(true)
    expect(error.text()).toContain('No se ha podido crear el archivo.')
    expect(error.text()).not.toMatch(/Ana|Leo|12345678Z/)
    expect(createObjectURL).not.toHaveBeenCalled()
    await wrapper.find('.file-error__back').trigger('click')
    expect(wrapper.emitted('back')).toHaveLength(1)
    wrapper.unmount()
  })

  it('sin navigator.canShare no aparece "Compartir archivo"', () => {
    const wrapper = mount(FinalScreen, { attachTo: document.body })
    expect(wrapper.find('.share-button').exists()).toBe(false)
    expect(wrapper.find('details.help').exists()).toBe(true)
    wrapper.unmount()
  })

  it('con navigator.canShare aparece "Compartir archivo" y comparte el XML', async () => {
    const share = vi.fn<(data: ShareData) => Promise<void>>().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { ...navigator, canShare: () => true, share })
    const wrapper = mount(FinalScreen, { attachTo: document.body })
    const button = wrapper.find('.share-button')
    expect(button.exists()).toBe(true)
    await button.trigger('click')
    await vi.runAllTimersAsync()
    const files = share.mock.calls[0]![0].files!
    expect(files[0]!.name).toBe('parte_RES-0001.xml')
    expect(wrapper.text()).toContain('Archivo compartido.')
    wrapper.unmount()
  })
})
