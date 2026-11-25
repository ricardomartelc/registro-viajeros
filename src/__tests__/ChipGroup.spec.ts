import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import ChipGroup from '../ui/shared/ChipGroup.vue'

const options = [
  { value: 'dni', label: 'DNI' },
  { value: 'pasaporte', label: 'Pasaporte' },
]

describe('ChipGroup', () => {
  it('selección única: usa radios y cambia el valor', async () => {
    const wrapper = mount(ChipGroup, {
      props: { legend: 'Tipo de documento', options, modelValue: 'dni' },
    })
    expect(wrapper.find('legend').text()).toBe('Tipo de documento')
    const inputs = wrapper.findAll('input')
    expect(inputs[0]!.attributes('type')).toBe('radio')

    await inputs[1]!.trigger('change')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['pasaporte'])
  })

  it('selección múltiple: usa casillas y añade o quita de la lista', async () => {
    const wrapper = mount(ChipGroup, {
      props: { legend: 'Con quién', options, modelValue: ['dni'], multiple: true },
    })
    const inputs = wrapper.findAll('input')
    expect(inputs[0]!.attributes('type')).toBe('checkbox')

    await inputs[1]!.trigger('change')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([['dni', 'pasaporte']])

    // Ahora la lista es ['dni', 'pasaporte']: al desmarcar DNI queda solo Pasaporte.
    await inputs[0]!.trigger('change')
    expect(wrapper.emitted('update:modelValue')![1]).toEqual([['pasaporte']])
  })

  it('marca la opción elegida con una clase, además del color', () => {
    const wrapper = mount(ChipGroup, {
      props: { legend: 'Tipo', options, modelValue: 'dni' },
    })
    const chips = wrapper.findAll('label')
    expect(chips[0]!.classes()).toContain('chip--on')
    expect(chips[1]!.classes()).not.toContain('chip--on')
  })
})
