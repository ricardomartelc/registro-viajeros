import type { Booking } from '../domain/types'
import { buildPartialXml } from '../xml/buildPartialXml'

// Archivo que descarga el huésped: el XML parcial para SES.HOSPEDAJES.
// No se guarda en ningún sitio (ni sessionStorage ni localStorage): se crea al pulsar
// "Descargar archivo" y se entrega al navegador.

export type BuildResult =
  | { ok: true; fileName: string; blob: Blob }
  | { ok: false; error: 'faltaDato' | 'codigoDesconocido' }

// Nombre del archivo: parte_<localizador>.xml, con el localizador limpio
// (solo letras sin acentos, números, guion y guion bajo). Si queda vacío: parte.xml
export function partialFileName(reference: string): string {
  const clean = reference.replace(/[^A-Za-z0-9_-]/g, '')
  return clean ? `parte_${clean}.xml` : 'parte.xml'
}

export function buildPartialFile(booking: Booking): BuildResult {
  const result = buildPartialXml(booking)
  if (!result.ok) return { ok: false, error: result.error }
  return {
    ok: true,
    fileName: partialFileName(booking.stay.reference),
    blob: new Blob([result.xml], { type: 'application/xml;charset=utf-8' }),
  }
}
