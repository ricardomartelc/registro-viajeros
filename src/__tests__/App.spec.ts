import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'
import { vReveal } from '../ui/shared/vReveal'

describe('App', () => {
  it('muestra la pantalla de bienvenida con el botón Comenzar', () => {
    const wrapper = mount(App, { global: { directives: { reveal: vReveal } } })
    expect(wrapper.text()).toContain('Can Vauma')
    expect(wrapper.text()).toContain('Comenzar')
  })
})
