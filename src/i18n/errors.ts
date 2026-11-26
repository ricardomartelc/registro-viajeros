import type { ErrorCode } from '../domain/errors'
import { t, type MessageKey } from './index'

// Clave de i18n de un código de error: 'dni.letraIncorrecta' → 'error.dni.letraIncorrecta'.
// Un test comprueba que todas existen en es.ts y en.ts.
export function errorKey(code: ErrorCode): MessageKey {
  return `error.${code}` as MessageKey
}

// Texto del error en el idioma actual.
export function errorText(code: ErrorCode): string {
  return t(errorKey(code))
}
