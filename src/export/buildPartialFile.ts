import type { Booking } from '../domain/types'

// Archivo que descarga el huésped (el XML parcial para SES.HOSPEDAJES).
//
// ⚠️ PENDIENTE (Bloque 5): todavía NO genera nada. Falta la plantilla XML, el XSD y el
// documento de instrucciones del ministerio (ver docs/pendiente-ministerio.md).
// No inventar el formato: hasta entonces devuelve el error 'noImplementado' y la
// pantalla Final muestra el botón "Descargar archivo" desactivado.

export type BuildResult =
  | { ok: true; fileName: string; content: string }
  | { ok: false; error: 'noImplementado' }

export function buildPartialFile(booking: Booking): BuildResult {
  void booking // se usará en el Bloque 5
  return { ok: false, error: 'noImplementado' }
}
