// Códigos de parentesco del documento de diseño de SES.HOSPEDAJES (plantilla v1.1.0).
// Los códigos son los del documento; su significado (etiquetas en src/i18n) es nuestra
// mejor lectura: POR CONFIRMAR con el documento del ministerio.
export const RELATIONSHIP_CODES = [
  'AB', // abuelo/a
  'BA', // bisabuelo/a
  'BN', // bisnieto/a
  'CD', // cuñado/a
  'CY', // cónyuge
  'HJ', // hijo/a
  'HR', // hermano/a
  'NI', // nieto/a
  'PM', // padre/madre
  'SB', // sobrino/a
  'SG', // suegro/a
  'TI', // tío/a
  'YN', // yerno/nuera
  'TU', // tutor/a
  'OT', // otro (incluye primo/a)
] as const

export type RelationshipCode = (typeof RELATIONSHIP_CODES)[number]

export function isRelationshipCode(value: string): value is RelationshipCode {
  return (RELATIONSHIP_CODES as readonly string[]).includes(value)
}
