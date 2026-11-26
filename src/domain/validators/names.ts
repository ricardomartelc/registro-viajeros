import type { ErrorCode } from '../errors'

// Nombres y apellidos: letras de cualquier alfabeto (\p{L}) con sus acentos y marcas (\p{M}),
// separadas por un espacio, un guion o un apóstrofo (' o ’).
// Ejemplos válidos: "María José", "Núñez", "O'Neill", "Jean-Luc", "Ζωή", "Иван", "王".
// Sin límite de longitud hasta tener el XSD del ministerio.
const NAME_FORMAT = /^[\p{L}\p{M}]+(?:[ '’-][\p{L}\p{M}]+)*$/u

export function validateName(text: string): ErrorCode | null {
  return NAME_FORMAT.test(text.trim()) ? null : 'nombre.caracteres'
}
