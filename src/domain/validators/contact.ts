import type { ErrorCode } from '../errors'

// Teléfono: '+' opcional al principio, cifras, espacios, paréntesis y guiones,
// con entre 6 y 15 cifras en total. Comprobación sencilla.
export function validatePhone(text: string): ErrorCode | null {
  const value = text.trim()
  if (!/^\+?[0-9 ()-]+$/.test(value)) return 'telefono.formato'
  const digits = value.replace(/\D/g, '').length
  return digits >= 6 && digits <= 15 ? null : 'telefono.formato'
}

// Correo: algo@algo.algo, sin espacios. Comprobación sencilla.
export function validateEmail(text: string): ErrorCode | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim()) ? null : 'correo.formato'
}
