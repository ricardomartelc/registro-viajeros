import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import DateField from '../ui/shared/DateField.vue'

function mountDate(modelValue = '') {
  return mount(DateField, {
    props: { id: 'fecha', legend: 'Fecha de entrada', modelValue },
    attachTo: document.body,
  })
}

describe('DateField', () => {
  it('tres campos con etiqueta y teclado numérico', () => {
    const wrapper = mountDate()
    const inputs = wrapper.findAll('input')
    expect(inputs).toHaveLength(3)
    for (const input of inputs) {
      expect(input.attributes('inputmode')).toBe('numeric')
      expect(wrapper.find(`label[for="${input.attributes('id')}"]`).exists()).toBe(true)
    }
    wrapper.unmount()
  })

  it('convierte día, mes y año en AAAA-MM-DD (con ceros)', async () => {
    const wrapper = mountDate()
    const [day, month, year] = wrapper.findAll('input')
    await day!.setValue('7')
    await month!.setValue('3')
    await year!.setValue('2027')
    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted[emitted.length - 1]).toEqual(['2027-03-07'])
    wrapper.unmount()
  })

  it('a medias devuelve el texto tal cual (el dominio dirá que falta)', async () => {
    const wrapper = mountDate()
    await wrapper.findAll('input')[2]!.setValue('2027')
    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted[emitted.length - 1]).toEqual(['2027--'])
    wrapper.unmount()
  })

  it('reparte un valor guardado en los tres campos', () => {
    const wrapper = mountDate('2027-07-12')
    const values = wrapper.findAll('input').map((input) => (input.element as HTMLInputElement).value)
    expect(values).toEqual(['12', '07', '2027'])
    wrapper.unmount()
  })

  it('avisa (leave) solo al salir de los tres campos', async () => {
    const wrapper = mountDate()
    const [day, month] = wrapper.findAll('input')
    await day!.trigger('focusout', { relatedTarget: month!.element })
    expect(wrapper.emitted('leave')).toBeUndefined()
    await month!.trigger('focusout', { relatedTarget: null })
    expect(wrapper.emitted('leave')).toHaveLength(1)
    wrapper.unmount()
  })
})
