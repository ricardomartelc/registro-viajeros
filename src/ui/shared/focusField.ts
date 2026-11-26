// Lleva el foco a un campo por su id. Si el id es de un grupo (fecha en tres campos,
// chips), lo lleva al primer control de dentro. Devuelve false si no lo encuentra.
export function focusField(id: string): boolean {
  const element = document.getElementById(id)
  if (!element) return false
  const target = element.matches('input, select, textarea')
    ? element
    : (element.querySelector<HTMLElement>('input, select, textarea') ?? element)
  target.focus()
  return true
}
