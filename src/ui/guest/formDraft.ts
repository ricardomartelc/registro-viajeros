// Opciones del formulario que NO son datos del ministerio (no van al XML):
// las casillas "Mismo domicilio que el titular" y "Usar el contacto del titular"
// de cada acompañante. Se guardan aparte del borrador de la reserva, también en
// sessionStorage, para no tocar el modelo de src/domain.
//
// Cada lista va por posición de persona (0 = titular, 1 = primer acompañante...).
// Un hueco (null) significa "sin decidir": vale como marcada (opción por defecto).
export interface FormFlags {
  sameAddress: (boolean | null)[]
  sameContact: (boolean | null)[]
}

const KEY = 'canvauma.borrador.formulario'

export function emptyFormFlags(): FormFlags {
  return { sameAddress: [], sameContact: [] }
}

export function saveFormFlags(flags: FormFlags): boolean {
  try {
    if (flags.sameAddress.length === 0 && flags.sameContact.length === 0) {
      sessionStorage.removeItem(KEY)
    } else {
      sessionStorage.setItem(KEY, JSON.stringify(flags))
    }
    return true
  } catch {
    return false
  }
}

export function loadFormFlags(): FormFlags {
  try {
    const text = sessionStorage.getItem(KEY)
    if (!text) return emptyFormFlags()
    const data = JSON.parse(text) as Partial<FormFlags>
    return {
      sameAddress: Array.isArray(data.sameAddress) ? data.sameAddress : [],
      sameContact: Array.isArray(data.sameContact) ? data.sameContact : [],
    }
  } catch {
    return emptyFormFlags()
  }
}

export function clearFormFlags(): void {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // Si no se puede, no había nada guardado.
  }
}
