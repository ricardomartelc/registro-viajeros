import type { ErrorCode } from '../errors'
import { RULES, isSpain } from '../rules'

// España: 5 cifras y, si la regla está activa, provincia 01 a 52.
// Otros países: formato libre (solo se pide que no esté vacío, eso lo hace validateBooking).
export function validatePostalCode(code: string, countryCode: string): ErrorCode | null {
  if (!isSpain(countryCode)) return null
  if (!/^\d{5}$/.test(code)) return 'cp.formato'
  const province = Number(code.slice(0, 2))
  if (RULES.checkSpanishProvince && (province < 1 || province > 52)) return 'cp.provincia'
  return null
}
