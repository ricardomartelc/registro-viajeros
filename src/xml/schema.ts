// ============================================================================
//  TODO lo que depende del ministerio (SES.HOSPEDAJES) está en ESTE archivo:
//  nombres de nodos, su orden, las tablas de códigos y la zona horaria.
//  El resto del código no escribe ningún nombre de nodo a mano.
//  Cuando llegue la plantilla XML / el XSD (docs/ministerio/), solo se cambia esto.
//
//  Marcas:
//   - SEGURO: dato confirmado por el propietario.
//   - BORRADOR: por confirmar con la plantilla del ministerio (no inventado a
//     propósito: es un nombre provisional y legible). Ver docs/pendiente-ministerio.md.
// ============================================================================

import type { DocumentType, Sex } from '../domain/types'
import type { PaymentMethod } from '../domain/payment'

// ---------- Cabecera y raíz ----------

export const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>' // SEGURO (UTF-8)

export const ROOT = {
  name: 'ns2:peticion', // SEGURO
  namespaceAttribute: 'xmlns:ns2', // SEGURO
  namespace: 'http://www.neg.hospedajes.mir.es/altaParteHospedaje', // SEGURO
}

// Comentarios que se escriben dentro del archivo para el propietario (sin datos personales).
export const PARTIAL_NOTE =
  'Archivo PARCIAL generado por el huesped en la web de Can Vauma. ' +
  'El propietario lo completa y lo valida antes de enviarlo a SES.HOSPEDAJES. ' +
  'BORRADOR: estructura por confirmar con la plantilla del ministerio.'
export const OWNER_DATA_NOTE =
  'BORRADOR: aqui faltan los datos que solo conoce el propietario ' +
  '(codigo de establecimiento, credenciales, etc.). No se piden al huesped.'

// ---------- Contrato (estancia) ----------

export const CONTRACT_NODE = 'contrato' // SEGURO

// Orden de los nodos dentro de <contrato>. required: si falta, no se genera el archivo.
export type ContractKey = 'reference' | 'checkIn' | 'checkOut' | 'numberOfPeople' | 'payment'
export const CONTRACT_FIELDS: { key: ContractKey; node: string; required: boolean }[] = [
  { key: 'reference', node: 'referencia', required: true }, // BORRADOR (nombre y obligatoriedad)
  { key: 'checkIn', node: 'fechaEntrada', required: true }, // BORRADOR (nombre); formato SEGURO
  { key: 'checkOut', node: 'fechaSalida', required: true }, // BORRADOR (nombre); formato SEGURO
  { key: 'numberOfPeople', node: 'numPersonas', required: true }, // BORRADOR
  { key: 'payment', node: 'pago', required: false }, // BORRADOR (nombre); opcional
]

// Dentro de <pago>
export const PAYMENT_TYPE_NODE = 'tipoPago' // BORRADOR (nombre)
// Fecha de tarjeta MM/AAAA: la plantilla la incluye, pero aún no está en el modelo (pendiente).

// ---------- Personas ----------

export const PEOPLE_NODE = 'personas' // SEGURO
export const PERSON_NODE = 'persona' // BORRADOR (nombre de cada persona dentro de <personas>)

// Orden de los nodos dentro de cada persona.
export type PersonKey =
  | 'role'
  | 'firstName'
  | 'surname1'
  | 'surname2'
  | 'documentType'
  | 'documentNumber'
  | 'supportNumber'
  | 'birthDate'
  | 'nationality'
  | 'sex'
  | 'address'
  | 'phone'
  | 'email'
  | 'relationship'
export const PERSON_FIELDS: { key: PersonKey; node: string; required: boolean }[] = [
  { key: 'role', node: 'rol', required: true }, // BORRADOR (nombre); códigos SEGUROS
  { key: 'firstName', node: 'nombre', required: true }, // BORRADOR
  { key: 'surname1', node: 'apellido1', required: true }, // BORRADOR
  { key: 'surname2', node: 'apellido2', required: false }, // BORRADOR
  // Documento: no obligatorio en el XML porque los menores de 14 pueden no tenerlo
  // (la regla de edad la aplica src/domain/rules.ts antes de llegar aquí).
  { key: 'documentType', node: 'tipoDocumento', required: false }, // BORRADOR (nombre)
  { key: 'documentNumber', node: 'numeroDocumento', required: false }, // BORRADOR
  { key: 'supportNumber', node: 'soporteDocumento', required: false }, // BORRADOR
  { key: 'birthDate', node: 'fechaNacimiento', required: true }, // BORRADOR (nombre); formato SEGURO
  { key: 'nationality', node: 'nacionalidad', required: true }, // BORRADOR (nombre); alfa-3 SEGURO
  { key: 'sex', node: 'sexo', required: true }, // BORRADOR
  { key: 'address', node: 'direccion', required: true }, // BORRADOR (nombre del bloque de dirección)
  { key: 'phone', node: 'telefono', required: false }, // BORRADOR
  { key: 'email', node: 'correo', required: false }, // BORRADOR
  { key: 'relationship', node: 'parentesco', required: false }, // BORRADOR (solo menores)
]

// Dirección de cada persona (dentro del nodo 'address' de arriba).
export type AddressKey = 'street' | 'city' | 'postalCode' | 'country'
export const ADDRESS_FIELDS: { key: AddressKey; node: string; required: boolean }[] = [
  { key: 'street', node: 'direccion', required: true }, // BORRADOR
  // Código de municipio del INE para domicilios en España: pendiente (hace falta la lista).
  { key: 'city', node: 'nombreMunicipio', required: true }, // BORRADOR
  { key: 'postalCode', node: 'codigoPostal', required: true }, // BORRADOR
  { key: 'country', node: 'pais', required: true }, // BORRADOR (nombre); alfa-3 SEGURO
]

// ---------- Tablas de códigos ----------

// Roles: SEGURO
export const ROLE_CODES = { holder: 'TI', companion: 'VI' } as const

// Tipo de documento: DNI, NIE y PASAPORTE son SEGUROS; 'OTRO' es BORRADOR.
export const DOCUMENT_CODES: Record<DocumentType, string> = {
  dni: 'DNI',
  nie: 'NIE',
  pasaporte: 'PASAPORTE',
  otro: 'OTRO', // BORRADOR
}

// Sexo: BORRADOR (códigos por confirmar)
export const SEX_CODES: Record<Sex, string> = {
  hombre: 'H',
  mujer: 'M',
  otro: 'O',
}

// Pago: SEGURO
export const PAYMENT_CODES: Record<PaymentMethod, string> = {
  tarjeta: 'TARJETA',
  transferencia: 'TRANSFERENCIA',
  efectivo: 'EFECTIVO',
  otro: 'OTRO',
}

// Parentesco: BORRADOR. No conocemos la lista de códigos: de momento se escribe
// el texto que pone el huésped (p. ej. "Hijo"), y el propietario lo revisa.
export const RELATIONSHIP_AS_FREE_TEXT = true

// País y nacionalidad: ISO 3166-1 alfa-2 (valor interno de la web) → alfa-3 (SEGURO).
// Debe tener todos los códigos de src/domain/countries.ts (lo comprueba un test).
export const COUNTRY_ALPHA3: Record<string, string> = {
  AD: 'AND', AE: 'ARE', AF: 'AFG', AG: 'ATG', AI: 'AIA', AL: 'ALB', AM: 'ARM', AO: 'AGO',
  AQ: 'ATA', AR: 'ARG', AS: 'ASM', AT: 'AUT', AU: 'AUS', AW: 'ABW', AX: 'ALA', AZ: 'AZE',
  BA: 'BIH', BB: 'BRB', BD: 'BGD', BE: 'BEL', BF: 'BFA', BG: 'BGR', BH: 'BHR', BI: 'BDI',
  BJ: 'BEN', BL: 'BLM', BM: 'BMU', BN: 'BRN', BO: 'BOL', BQ: 'BES', BR: 'BRA', BS: 'BHS',
  BT: 'BTN', BV: 'BVT', BW: 'BWA', BY: 'BLR', BZ: 'BLZ', CA: 'CAN', CC: 'CCK', CD: 'COD',
  CF: 'CAF', CG: 'COG', CH: 'CHE', CI: 'CIV', CK: 'COK', CL: 'CHL', CM: 'CMR', CN: 'CHN',
  CO: 'COL', CR: 'CRI', CU: 'CUB', CV: 'CPV', CW: 'CUW', CX: 'CXR', CY: 'CYP', CZ: 'CZE',
  DE: 'DEU', DJ: 'DJI', DK: 'DNK', DM: 'DMA', DO: 'DOM', DZ: 'DZA', EC: 'ECU', EE: 'EST',
  EG: 'EGY', EH: 'ESH', ER: 'ERI', ES: 'ESP', ET: 'ETH', FI: 'FIN', FJ: 'FJI', FK: 'FLK',
  FM: 'FSM', FO: 'FRO', FR: 'FRA', GA: 'GAB', GB: 'GBR', GD: 'GRD', GE: 'GEO', GF: 'GUF',
  GG: 'GGY', GH: 'GHA', GI: 'GIB', GL: 'GRL', GM: 'GMB', GN: 'GIN', GP: 'GLP', GQ: 'GNQ',
  GR: 'GRC', GS: 'SGS', GT: 'GTM', GU: 'GUM', GW: 'GNB', GY: 'GUY', HK: 'HKG', HM: 'HMD',
  HN: 'HND', HR: 'HRV', HT: 'HTI', HU: 'HUN', ID: 'IDN', IE: 'IRL', IL: 'ISR', IM: 'IMN',
  IN: 'IND', IO: 'IOT', IQ: 'IRQ', IR: 'IRN', IS: 'ISL', IT: 'ITA', JE: 'JEY', JM: 'JAM',
  JO: 'JOR', JP: 'JPN', KE: 'KEN', KG: 'KGZ', KH: 'KHM', KI: 'KIR', KM: 'COM', KN: 'KNA',
  KP: 'PRK', KR: 'KOR', KW: 'KWT', KY: 'CYM', KZ: 'KAZ', LA: 'LAO', LB: 'LBN', LC: 'LCA',
  LI: 'LIE', LK: 'LKA', LR: 'LBR', LS: 'LSO', LT: 'LTU', LU: 'LUX', LV: 'LVA', LY: 'LBY',
  MA: 'MAR', MC: 'MCO', MD: 'MDA', ME: 'MNE', MF: 'MAF', MG: 'MDG', MH: 'MHL', MK: 'MKD',
  ML: 'MLI', MM: 'MMR', MN: 'MNG', MO: 'MAC', MP: 'MNP', MQ: 'MTQ', MR: 'MRT', MS: 'MSR',
  MT: 'MLT', MU: 'MUS', MV: 'MDV', MW: 'MWI', MX: 'MEX', MY: 'MYS', MZ: 'MOZ', NA: 'NAM',
  NC: 'NCL', NE: 'NER', NF: 'NFK', NG: 'NGA', NI: 'NIC', NL: 'NLD', NO: 'NOR', NP: 'NPL',
  NR: 'NRU', NU: 'NIU', NZ: 'NZL', OM: 'OMN', PA: 'PAN', PE: 'PER', PF: 'PYF', PG: 'PNG',
  PH: 'PHL', PK: 'PAK', PL: 'POL', PM: 'SPM', PN: 'PCN', PR: 'PRI', PS: 'PSE', PT: 'PRT',
  PW: 'PLW', PY: 'PRY', QA: 'QAT', RE: 'REU', RO: 'ROU', RS: 'SRB', RU: 'RUS', RW: 'RWA',
  SA: 'SAU', SB: 'SLB', SC: 'SYC', SD: 'SDN', SE: 'SWE', SG: 'SGP', SH: 'SHN', SI: 'SVN',
  SJ: 'SJM', SK: 'SVK', SL: 'SLE', SM: 'SMR', SN: 'SEN', SO: 'SOM', SR: 'SUR', SS: 'SSD',
  ST: 'STP', SV: 'SLV', SX: 'SXM', SY: 'SYR', SZ: 'SWZ', TC: 'TCA', TD: 'TCD', TF: 'ATF',
  TG: 'TGO', TH: 'THA', TJ: 'TJK', TK: 'TKL', TL: 'TLS', TM: 'TKM', TN: 'TUN', TO: 'TON',
  TR: 'TUR', TT: 'TTO', TV: 'TUV', TW: 'TWN', TZ: 'TZA', UA: 'UKR', UG: 'UGA', UM: 'UMI',
  US: 'USA', UY: 'URY', UZ: 'UZB', VA: 'VAT', VC: 'VCT', VE: 'VEN', VG: 'VGB', VI: 'VIR',
  VN: 'VNM', VU: 'VUT', WF: 'WLF', WS: 'WSM', YE: 'YEM', YT: 'MYT', ZA: 'ZAF', ZM: 'ZMB',
  ZW: 'ZWE',
}

// ---------- Fechas ----------

// Fechas simples: AAAA-MM-DD (SEGURO).
// Fechas con hora: AAAA-MM-DDThh:mm:ss+02:00 (SEGURO), con el desfase de España peninsular
// y Baleares en esa fecha: +01:00 en invierno y +02:00 en verano.
export const TIME_ZONE = 'Europe/Madrid'
