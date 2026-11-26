import { describe, it, expect, afterEach, vi } from 'vitest'
// '?raw': Vite carga el archivo como texto tal cual
import goldenXml from './fixtures/parte-3-personas.xml?raw'

import { buildPartialXml, escapeXml } from '../xml/buildPartialXml'
import { buildPartialFile, partialFileName } from '../export/buildPartialFile'
import { madridDateTime, madridOffset } from '../xml/timeZone'
import {
  COUNTRY_ALPHA3,
  PEOPLE_NODE,
  PERSON_FIELDS,
  PERSON_NODE,
  ROOT,
  CONTRACT_FIELDS,
} from '../xml/schema'
import { COUNTRY_CODES } from '../domain/countries'
import { oneGuestBooking, threeGuestBooking } from './xmlBookings'

// Nombres de nodo sacados de schema.ts (los tests tampoco los escriben a mano)
const node = (key: string) => PERSON_FIELDS.find((field) => field.key === key)!.node
const contractNode = (key: string) => CONTRACT_FIELDS.find((field) => field.key === key)!.node

function parse(xml: string): Document {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  expect(doc.getElementsByTagName('parsererror')).toHaveLength(0) // bien formado
  return doc
}

function build(booking = oneGuestBooking()): string {
  const result = buildPartialXml(booking)
  if (!result.ok) throw new Error(`No se generó: ${result.error} ${result.node}`)
  return result.xml
}

const texts = (doc: Document, tag: string) =>
  Array.from(doc.getElementsByTagName(tag)).map((element) => element.textContent)

describe('XML parcial', () => {
  afterEach(() => vi.restoreAllMocks())

  it('1 persona: bien formado, espacio de nombres correcto, cabecera UTF-8 y una persona TI', () => {
    const xml = build()
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    const doc = parse(xml)
    expect(doc.documentElement.nodeName).toBe(ROOT.name)
    expect(doc.documentElement.namespaceURI).toBe(ROOT.namespace)
    expect(doc.getElementsByTagName(PEOPLE_NODE)).toHaveLength(1)
    expect(doc.getElementsByTagName(PERSON_NODE)).toHaveLength(1)
    expect(texts(doc, node('role'))).toEqual(['TI'])
  })

  it('3 personas: titular TI y acompañantes VI, en el orden de la lista', () => {
    const doc = parse(build(threeGuestBooking()))
    expect(doc.getElementsByTagName(PERSON_NODE)).toHaveLength(3)
    expect(texts(doc, node('role'))).toEqual(['TI', 'VI', 'VI'])
    expect(texts(doc, node('firstName'))).toEqual(['Ana', 'Luis', 'Leo'])
  })

  it('fechas: simples AAAA-MM-DD y con hora y desfase (invierno +01:00, verano +02:00)', () => {
    const winter = parse(build())
    expect(texts(winter, contractNode('checkIn'))).toEqual(['2027-01-15T16:00:00+01:00'])
    expect(texts(winter, node('birthDate'))).toEqual(['1985-03-10'])

    const summer = parse(build(threeGuestBooking()))
    expect(texts(summer, contractNode('checkIn'))).toEqual(['2027-07-12T16:00:00+02:00'])
    expect(texts(summer, contractNode('checkOut'))).toEqual(['2027-07-19T11:00:00+02:00'])
  })

  it('países y nacionalidades en ISO alfa-3', () => {
    const doc = parse(build(threeGuestBooking()))
    expect(texts(doc, node('nationality'))).toEqual(['ESP', 'DEU', 'FRA'])
    expect(build(threeGuestBooking())).toContain('>ESP<')
  })

  it('el menor lleva parentesco y no lleva documento; los adultos no llevan parentesco', () => {
    const doc = parse(build(threeGuestBooking()))
    expect(texts(doc, node('relationship'))).toEqual(['Hijo'])
    expect(texts(doc, node('documentType'))).toEqual(['DNI', 'PASAPORTE'])
  })

  it('omite los nodos opcionales vacíos (sin segundo apellido, sin pago)', () => {
    const booking = oneGuestBooking()
    booking.people[0]!.surname2 = ''
    const xml = build(booking)
    expect(xml).not.toContain(`<${node('surname2')}>`)
    expect(xml).not.toContain(`<${contractNode('payment')}>`)
    expect(xml).not.toMatch(/<(\w+)><\/\1>/) // ningún nodo vacío
  })

  it('escapa los caracteres especiales de lo que escribe el huésped', () => {
    const booking = oneGuestBooking()
    booking.people[0]!.surname1 = "O'Brien & Sons"
    booking.people[0]!.address.street = '<script>alert("x")</script>'
    const xml = build(booking)
    expect(xml).not.toContain('<script>')
    expect(xml).toContain('O&apos;Brien &amp; Sons')
    const doc = parse(xml)
    expect(texts(doc, node('surname1'))).toEqual(["O'Brien & Sons"])
    expect(doc.documentElement.textContent).toContain('<script>alert("x")</script>')
  })

  it('acentos, ñ y alfabetos no latinos salen intactos', () => {
    const booking = threeGuestBooking()
    booking.people[0]!.firstName = 'María José'
    booking.people[0]!.surname1 = 'Núñez'
    booking.people[1]!.firstName = 'Ζωή'
    booking.people[1]!.surname1 = 'Иванова'
    booking.people[2]!.firstName = '王'
    const doc = parse(build(booking))
    expect(texts(doc, node('firstName'))).toEqual(['María José', 'Ζωή', '王'])
    expect(texts(doc, node('surname1'))).toContain('Núñez')
    expect(texts(doc, node('surname1'))).toContain('Иванова')
  })

  it('escapeXml quita caracteres de control no válidos en XML', () => {
    expect(escapeXml('a\u0001b\tc')).toBe('ab\tc')
  })

  it('si falta un dato obligatorio, no genera el archivo y dice qué nodo falta (sin datos personales)', () => {
    const logs = [vi.spyOn(console, 'log'), vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')]
    const booking = threeGuestBooking()
    booking.people[1]!.firstName = ''
    const result = buildPartialXml(booking)
    expect(result).toEqual({ ok: false, error: 'faltaDato', node: node('firstName') })
    expect(JSON.stringify(result)).not.toMatch(/Ana|Luis|12345678Z|Ejemplo/)
    for (const log of logs) expect(log).not.toHaveBeenCalled()
  })

  it('un código de país desconocido tampoco genera el archivo', () => {
    const booking = oneGuestBooking()
    booking.people[0]!.nationality = 'XX'
    expect(buildPartialXml(booking)).toEqual({
      ok: false,
      error: 'codigoDesconocido',
      node: node('nationality'),
    })
  })

  // Si cambia algo del XML a propósito (p. ej. al llegar la plantilla), hay que revisar
  // el cambio y actualizar fixtures/parte-3-personas.xml a mano.
  it('archivo de oro: la reserva de 3 personas genera exactamente el XML guardado', () => {
    expect(build(threeGuestBooking())).toBe(goldenXml)
  })
})

describe('Tabla de países alfa-2 → alfa-3', () => {
  it('no falta ningún país del selector y todos son de 3 letras distintos', () => {
    const missing = COUNTRY_CODES.filter((code) => !/^[A-Z]{3}$/.test(COUNTRY_ALPHA3[code] ?? ''))
    expect(missing).toEqual([])
    const values = COUNTRY_CODES.map((code) => COUNTRY_ALPHA3[code])
    expect(new Set(values).size).toBe(values.length)
  })

  it('algunos códigos conocidos', () => {
    expect(COUNTRY_ALPHA3.ES).toBe('ESP')
    expect(COUNTRY_ALPHA3.FR).toBe('FRA')
    expect(COUNTRY_ALPHA3.GB).toBe('GBR')
    expect(COUNTRY_ALPHA3.DE).toBe('DEU')
  })
})

describe('Desfase horario de Europe/Madrid', () => {
  it('invierno +01:00 y verano +02:00', () => {
    expect(madridOffset('2027-01-15', '16:00')).toBe('+01:00')
    expect(madridOffset('2027-07-12', '16:00')).toBe('+02:00')
    expect(madridDateTime('2027-07-12', '16:00')).toBe('2027-07-12T16:00:00+02:00')
  })

  it('cambio de hora de marzo (28/03/2027: a las 02:00 pasan a ser las 03:00)', () => {
    expect(madridOffset('2027-03-28', '01:59')).toBe('+01:00')
    expect(madridOffset('2027-03-28', '02:30')).toBe('+02:00') // hora que no existe
    expect(madridOffset('2027-03-28', '03:00')).toBe('+02:00')
  })

  it('cambio de hora de octubre (31/10/2027: a las 03:00 vuelven a ser las 02:00)', () => {
    expect(madridOffset('2027-10-31', '01:59')).toBe('+02:00')
    expect(madridOffset('2027-10-31', '02:30')).toBe('+02:00') // hora repetida: la primera
    expect(madridOffset('2027-10-31', '03:00')).toBe('+01:00')
  })
})

describe('Nombre y contenido del archivo', () => {
  it('parte_<localizador>.xml con el localizador limpio', () => {
    expect(partialFileName('RES-0001')).toBe('parte_RES-0001.xml')
    expect(partialFileName('ABC_12')).toBe('parte_ABC_12.xml')
    expect(partialFileName('../../etc/passwd')).toBe('parte_etcpasswd.xml')
    expect(partialFileName('Rés 01/ñ?')).toBe('parte_Rs01.xml')
    expect(partialFileName('')).toBe('parte.xml')
    expect(partialFileName('¿¡ ñ !?')).toBe('parte.xml')
  })

  it('buildPartialFile devuelve un Blob XML con el nombre correcto', async () => {
    const result = buildPartialFile(threeGuestBooking())
    if (!result.ok) throw new Error('no generado')
    expect(result.fileName).toBe('parte_RES-0003.xml')
    expect(result.blob.type).toContain('application/xml')
    expect(await result.blob.text()).toBe(build(threeGuestBooking()))
  })
})
