import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import FloatingBar from '../ui/shared/FloatingBar.vue'

const items = [
  { value: 'inicio', label: 'Inicio', icon: 'home' as const },
  { value: 'datos', label: 'Datos', icon: 'user' as const },
]

describe('FloatingBar', () => {
  it('cada botón tiene nombre para lectores de pantalla y marca el activo', () => {
    const wrapper = mount(FloatingBar, {
      props: { label: 'Navegación', items, modelValue: 'inicio' },
    })
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Navegación')
    const buttons = wrapper.findAll('button')
    expect(buttons[0]!.attributes('aria-label')).toBe('Inicio')
    expect(buttons[0]!.attributes('aria-current')).toBe('page')
    expect(buttons[1]!.attributes('aria-current')).toBeUndefined()
  })

  it('al pulsar cambia la opción activa', async () => {
    const wrapper = mount(FloatingBar, {
      props: { label: 'Navegación', items, modelValue: 'inicio' },
    })
    await wrapper.findAll('button')[1]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['datos'])
  })
})
