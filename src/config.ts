// Configuración de la web.

// Dirección de correo donde el huésped envía su archivo.
// ⚠️ El valor de abajo es un EJEMPLO que no funciona (el dominio .invalid no existe).
// Sustituir por la dirección real del propietario, pero NO escribirla aquí: el repositorio
// es público. Usar la variable de entorno VITE_RECEPTION_EMAIL, por ejemplo en un archivo
// .env.local (no se sube: .gitignore ya ignora *.local):
//   VITE_RECEPTION_EMAIL=direccion-real@dominio
const EXAMPLE_RECEPTION_EMAIL = 'registro@ejemplo.invalid'

// Lee la dirección de las variables de entorno (o usa el ejemplo). 'env' se puede pasar
// desde fuera para probarlo en los tests.
export function receptionEmail(env: Record<string, unknown> = import.meta.env): string {
  const value = env.VITE_RECEPTION_EMAIL
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : EXAMPLE_RECEPTION_EMAIL
}

export const RECEPTION_EMAIL = receptionEmail()
