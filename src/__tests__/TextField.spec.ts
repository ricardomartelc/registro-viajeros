import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import TextField from '../ui/shared/TextField.vue'

describe('TextField', () => {
  it('la etiqueta está unida al campo y pasa los atributos para el móvil', () => {
    const wrapper = mount(TextField, {
      props: {
        label: 'Correo electrónico',
        type: 'email',
        autocomplete: 'email',
        inputmode: 'email',
        enterkeyhint: 'next',
      },
    })
    const input = wrapper.find('input')
    expect(wrapper.find('label').attributes('for')).toBe(input.attributes('id'))
    expect(input.attributes('autocomplete')).toBe('email')
    expect(input.attributes('inputmode')).toBe('email')
    expect(input.attributes('enterkeyhint')).toBe('next')
  })

  it('el error se muestra con texto y queda enlazado al campo', () => {
    const wrapper = mount(TextField, {
      props: { label: 'Documento', hint: 'Por ejemplo: 00000000T', error: 'Es demasiado corto.' },
    })
    const input = wrapper.find('input')
    expect(wrapper.text()).toContain('Es demasiado corto.')
    expect(input.attributes('aria-invalid')).toBe('true')

    const describedBy = input.attributes('aria-describedby')!.split(' ')
    expect(describedBy).toHaveLength(2)
    for (const id of describedBy) {
      expect(wrapper.find(`[id="${id}"]`).exists()).toBe(true)
    }
  })

  it('sin error no marca el campo como inválido', () => {
    const wrapper = mount(TextField, { props: { label: 'Nombre' } })
    expect(wrapper.find('input').attributes('aria-invalid')).toBeUndefined()
  })

  it('actualiza el valor al escribir', async () => {
    const wrapper = mount(TextField, { props: { label: 'Nombre', modelValue: '' } })
    await wrapper.find('input').setValue('Ana')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['Ana'])
  })
})
