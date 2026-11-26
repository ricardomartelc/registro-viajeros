import { ageOn } from '../dates'
import { isMinorAge } from '../rules'

// ¿Es menor de edad en la fecha de entrada? (no con la fecha de hoy)
// Las dos fechas deben ser reales. La edad adulta está en rules.ts.
export function isMinorOn(birthDate: string, checkInDate: string): boolean {
  return isMinorAge(ageOn(birthDate, checkInDate))
}
