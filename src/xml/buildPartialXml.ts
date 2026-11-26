import type { Booking, Person } from '../domain/types'
import {
  ADDRESS_FIELDS,
  COMMUNICATION_NODE,
  CONTACT_FIELDS,
  CONTRACT_FIELDS,
  CONTRACT_NODE,
  COUNTRY_ALPHA3,
  DOCUMENT_CODES,
  OWNER_DATA_NOTE,
  PARTIAL_NOTE,
  PERSON_FIELDS,
  PERSON_NODE,
  PERSON_ROLE,
  REQUEST_NODE,
  ROOT,
  SEX_CODES,
  XML_HEADER,
  type AddressKey,
  type ContactKey,
  type ContractKey,
  type PersonKey,
} from './schema'
import { ageOn, isRealDate } from '../domain/dates'
import { isMinorAge } from '../domain/rules'

// Genera el texto del XML PARCIAL a partir de una reserva ya validada (pantalla Revisar).
// Los nombres de nodos, su orden y los códigos salen de schema.ts: aquí no se escribe ninguno.
//
// - Escapa siempre lo que escribe el huésped (&, <, >, comillas).
// - Omite los nodos opcionales vacíos.
// - Si falta un dato obligatorio, NO genera el archivo: devuelve un error con el nombre
//   del nodo que falta (nunca con datos personales). No escribe nada en la consola.

export type XmlResult =
  | { ok: true; xml: string }
  | { ok: false; error: 'faltaDato' | 'codigoDesconocido'; node: string }

// Error interno para cortar la generación en cuanto falta algo.
class BuildError extends Error {
  constructor(
    readonly reason: 'faltaDato' | 'codigoDesconocido',
    readonly node: string,
  ) {
    super(reason) // el mensaje no lleva datos personales
  }
}

// ---------- Utilidades ----------

// Escapa los caracteres especiales de XML y quita los caracteres de control no válidos.
export function escapeXml(text: string): string {
  // Caracteres de control (no válidos en XML): fuera, salvo tabulador y saltos de línea.
  const printable = Array.from(text)
    .filter((char) => {
      const code = char.codePointAt(0)!
      return code >= 0x20 || code === 0x09 || code === 0x0a || code === 0x0d
    })
    .join('')
  return printable
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const INDENT = '  '

// Un nodo con texto: <nombre>texto</nombre>. Vacío y opcional → no se escribe.
function leaf(node: string, value: string, required: boolean, depth: number): string[] {
  const text = value.trim()
  if (!text) {
    if (required) throw new BuildError('faltaDato', node)
    return []
  }
  return [`${INDENT.repeat(depth)}<${node}>${escapeXml(text)}</${node}>`]
}

// Un nodo con hijos. Sin hijos y opcional → no se escribe.
function group(node: string, children: string[], required: boolean, depth: number): string[] {
  if (children.length === 0) {
    if (required) throw new BuildError('faltaDato', node)
    return []
  }
  const pad = INDENT.repeat(depth)
  return [`${pad}<${node}>`, ...children, `${pad}</${node}>`]
}

function countryCode(alpha2: string, node: string): string {
  if (!alpha2) return ''
  const code = COUNTRY_ALPHA3[alpha2.toUpperCase()]
  if (!code) throw new BuildError('codigoDesconocido', node)
  return code
}

// ---------- Contrato ----------

function contractValue(booking: Booking, key: ContractKey): string {
  const { stay } = booking
  if (key === 'numberOfPeople') return stay.numberOfPeople > 0 ? String(stay.numberOfPeople) : ''
  return stay[key] // referencia y fechas (AAAA-MM-DD, sin hora)
}

function contractLines(booking: Booking, depth: number): string[] {
  const lines = CONTRACT_FIELDS.flatMap((field) =>
    leaf(field.node, contractValue(booking, field.key), field.required, depth + 1),
  )
  return group(CONTRACT_NODE, lines, true, depth)
}

// ---------- Personas ----------

// ¿Es menor a la fecha de entrada? (solo los menores llevan parentesco)
function isMinor(person: Person, checkInDate: string): boolean {
  if (!isRealDate(person.birthDate) || !isRealDate(checkInDate)) return false
  return isMinorAge(ageOn(person.birthDate, checkInDate))
}

function addressValue(person: Person, key: AddressKey, node: string): string {
  if (key === 'country') return countryCode(person.address.country, node)
  return person.address[key]
}

function contactValue(person: Person, key: ContactKey): string {
  return person[key]
}

function personValue(person: Person, key: PersonKey, minor: boolean, node: string): string {
  switch (key) {
    case 'role':
      return PERSON_ROLE // todas las personas: VI
    case 'documentType':
      return person.documentType ? DOCUMENT_CODES[person.documentType] : ''
    case 'sex':
      return person.sex ? SEX_CODES[person.sex] : ''
    case 'nationality':
      return countryCode(person.nationality, node)
    case 'relationship':
      return minor ? person.relationship : '' // ya es un código (AB, HJ…)
    case 'address':
    case 'contact':
      return '' // son grupos: se escriben aparte
    default:
      return person[key]
  }
}

function personLines(person: Person, checkInDate: string, depth: number): string[] {
  const minor = isMinor(person, checkInDate)
  const lines: string[] = []
  for (const field of PERSON_FIELDS) {
    if (field.key === 'address') {
      const children = ADDRESS_FIELDS.flatMap((part) =>
        leaf(part.node, addressValue(person, part.key, part.node), part.required, depth + 2),
      )
      lines.push(...group(field.node, children, field.required, depth + 1))
    } else if (field.key === 'contact') {
      const children = CONTACT_FIELDS.flatMap((part) =>
        leaf(part.node, contactValue(person, part.key), part.required, depth + 2),
      )
      lines.push(...group(field.node, children, field.required, depth + 1))
    } else {
      const value = personValue(person, field.key, minor, field.node)
      lines.push(...leaf(field.node, value, field.required, depth + 1))
    }
  }
  return group(PERSON_NODE, lines, true, depth)
}

// ---------- Archivo completo ----------

// peticion > solicitud > comunicacion > (contrato, persona, persona…)
export function buildPartialXml(booking: Booking): XmlResult {
  try {
    const checkIn = booking.stay.checkInDate
    const communication = [
      ...contractLines(booking, 3),
      ...booking.people.flatMap((person) => personLines(person, checkIn, 3)),
    ]
    const lines = [
      XML_HEADER,
      `<!-- ${PARTIAL_NOTE} -->`,
      `<${ROOT.name} ${ROOT.namespaceAttribute}="${ROOT.namespace}">`,
      `${INDENT}<!-- ${OWNER_DATA_NOTE} -->`,
      ...group(REQUEST_NODE, group(COMMUNICATION_NODE, communication, true, 2), true, 1),
      `</${ROOT.name}>`,
    ]
    return { ok: true, xml: `${lines.join('\n')}\n` }
  } catch (error) {
    if (error instanceof BuildError) return { ok: false, error: error.reason, node: error.node }
    throw error
  }
}
