import { describe, it, expect } from 'vitest'

import { h } from 'vue'
import { mount } from '@vue/test-utils'
import FormGroup from '../ui/shared/FormGroup.vue'
import FormRow from '../ui/shared/FormRow.vue'

describe('FormGroup y FormRow', () => {
  it('muestra título, filas y nota', () => {
    const wrapper = mount(FormGroup, {
      props: { title: 'Estancia', note: 'Nota de prueba' },
      slots: {
        default: () => [
          h(FormRow, { label: 'Entrada' }, () => '12/07/2027'),
          h(FormRow, { label: 'Salida' }, () => '19/07/2027'),
        ],
      },
    })
    expect(wrapper.find('h2').text()).toBe('Estancia')
    expect(wrapper.findAll('.row')).toHaveLength(2)
    expect(wrapper.text()).toContain('Entrada')
    expect(wrapper.text()).toContain('Nota de prueba')
  })

  it('una fila sin etiqueta deja el contenido a todo el ancho', () => {
    const wrapper = mount(FormRow, { slots: { default: 'Contenido' } })
    expect(wrapper.find('.row__label').exists()).toBe(false)
    expect(wrapper.find('.row__content--full').exists()).toBe(true)
  })
})
