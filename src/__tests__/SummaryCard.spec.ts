import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import SummaryCard from '../ui/shared/SummaryCard.vue'

describe('SummaryCard', () => {
  it('muestra una fila de etiqueta y valor por dato', () => {
    const rows = [
      { label: 'Nombre', value: 'Ana Ejemplo' },
      { label: 'Entrada', value: '12/07/2027' },
      { label: 'Salida', value: '19/07/2027' },
    ]
    const wrapper = mount(SummaryCard, { props: { title: 'Resumen', rows } })
    expect(wrapper.find('h2').text()).toBe('Resumen')
    expect(wrapper.findAll('dt').map((d) => d.text())).toEqual(['Nombre', 'Entrada', 'Salida'])
    expect(wrapper.findAll('dd')[0]!.text()).toBe('Ana Ejemplo')
  })
})
