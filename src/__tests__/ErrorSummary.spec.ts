import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import ErrorSummary from '../ui/shared/ErrorSummary.vue'

describe('ErrorSummary', () => {
  it('sin errores no muestra nada', () => {
    const wrapper = mount(ErrorSummary, { props: { items: [] } })
    expect(wrapper.find('.summary').exists()).toBe(false)
  })

  it('un enlace por error; al pulsarlo lleva el foco al campo', async () => {
    const field = document.createElement('input')
    field.id = 'campo-nombre'
    document.body.appendChild(field)

    const wrapper = mount(ErrorSummary, {
      props: { items: [{ id: 'campo-nombre', text: 'Este dato es obligatorio.' }] },
      attachTo: document.body,
    })
    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('#campo-nombre')
    await link.trigger('click')
    expect(document.activeElement).toBe(field)

    wrapper.unmount()
    field.remove()
  })

  it('en un grupo (fecha, chips) lleva el foco al primer control de dentro', async () => {
    const group = document.createElement('fieldset')
    group.id = 'campo-fecha'
    group.innerHTML = '<input id="dia"><input id="mes">'
    document.body.appendChild(group)

    const wrapper = mount(ErrorSummary, {
      props: { items: [{ id: 'campo-fecha', text: 'Esa fecha no existe.' }] },
      attachTo: document.body,
    })
    await wrapper.find('a').trigger('click')
    expect(document.activeElement?.id).toBe('dia')

    wrapper.unmount()
    group.remove()
  })
})
