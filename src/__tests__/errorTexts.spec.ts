import { describe, it, expect } from 'vitest'

import { ERROR_CODES } from '../domain/errors'
import { es } from '../i18n/es'
import { en } from '../i18n/en'
import { errorKey } from '../i18n/errors'

describe('Textos de error', () => {
  it.each(ERROR_CODES)('"%s" tiene texto en español y en inglés', (code) => {
    const key = errorKey(code)
    expect(es[key]).toBeTruthy()
    expect(en[key]).toBeTruthy()
  })
})
