import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import SelectField from '../ui/shared/SelectField.vue'

const options = [
  { value: 'ES', label: 'España' },
  { value: 'FR', label: 'Francia' },
]

describe('SelectField', () => {
  it('select nativo con etiqueta y opción vacía al principio', () => {
    const wrapper = mount(SelectField, { props: { id: 'pais', label: 'País', options } })
    expect(wrapper.find('label').attributes('for')).toBe('pais')
    const optionTags = wrapper.findAll('option')
    expect(optionTags).toHaveLength(3)
    expect(optionTags[0]!.attributes('value')).toBe('')
  })

  it('cambia el valor al elegir', async () => {
    const wrapper = mount(SelectField, {
      props: { id: 'pais', label: 'País', options, modelValue: '' },
    })
    await wrapper.find('select').setValue('FR')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['FR'])
  })

  it('muestra el error con texto y lo enlaza', () => {
    const wrapper = mount(SelectField, {
      props: { id: 'pais', label: 'País', options, error: 'Elija un país.' },
    })
    expect(wrapper.text()).toContain('Elija un país.')
    expect(wrapper.find('select').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('select').attributes('aria-describedby')).toBe('pais-error')
  })
})
