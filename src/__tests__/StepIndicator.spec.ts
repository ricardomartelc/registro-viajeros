import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import StepIndicator from '../ui/shared/StepIndicator.vue'

const steps = [
  { icon: 'home' as const, label: 'Estancia' },
  { icon: 'user' as const, label: 'Datos' },
  { icon: 'check' as const, label: 'Revisar' },
]

describe('StepIndicator', () => {
  it('muestra un elemento por paso, con su texto para lectores de pantalla', () => {
    const wrapper = mount(StepIndicator, { props: { steps, current: 1 } })
    const items = wrapper.findAll('li')
    expect(items).toHaveLength(3)
    expect(wrapper.text()).toContain('Datos')
  })

  it('marca el paso actual y los anteriores', () => {
    const wrapper = mount(StepIndicator, { props: { steps, current: 1 } })
    const items = wrapper.findAll('li')

    expect(items[1]!.attributes('aria-current')).toBe('step')
    expect(items[0]!.attributes('aria-current')).toBeUndefined()

    expect(items[0]!.classes()).toContain('steps__item--reached')
    expect(items[1]!.classes()).toContain('steps__item--reached')
    expect(items[2]!.classes()).not.toContain('steps__item--reached')
  })
})
