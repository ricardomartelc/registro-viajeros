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

// ---------------------------------------------------------------------------
// MODO PRUEBAS: navegación libre.
// Con `npm run dev` se puede ir adelante y atrás por todas las pantallas aunque falten
// datos o haya errores (los errores se siguen enseñando al salir de cada campo).
// - En la versión final (`npm run build`) está SIEMPRE apagado: se exigen los datos.
// - En los tests también está apagado (comprueban el comportamiento real).
// - Para probar el modo estricto con `npm run dev`, cree un archivo .env.local con:
//     VITE_NAVEGACION_LIBRE=false
// Cuando la web esté terminada, se puede borrar este interruptor.
// ---------------------------------------------------------------------------
export function freeNavigation(env: Record<string, unknown> = import.meta.env): boolean {
  return env.DEV === true && env.MODE !== 'test' && env.VITE_NAVEGACION_LIBRE !== 'false'
}

export const FREE_NAVIGATION = freeNavigation()
