// ============================================================================
//  TODO lo que depende del ministerio (SES.HOSPEDAJES) está en ESTE archivo:
//  nombres de nodos, su orden, las tablas de códigos y la zona horaria.
//  El resto del código no escribe ningún nombre de nodo a mano.
//
//  Fuente: documento de diseño (plantilla oficial v1.1.0). El XSD real tendrá la
//  última palabra: cuando llegue (docs/ministerio/), solo se cambia este archivo.
//
//  Marcas:
//   - SEGURO: confirmado (por el propietario o por el documento de diseño).
//   - BORRADOR: estructura orientativa, por confirmar con la plantilla / el XSD.
//     Ver docs/pendiente-ministerio.md.
//
//  El archivo del huésped es PARCIAL a propósito. NO incluye (los añade el
//  propietario al unir, Bloque 6): codigoEstablecimiento, pago (siempre PLATF),
//  horas de entrada y salida, numHabitaciones ni internet.
// ============================================================================

import type { DocumentType, Sex } from '../domain/types'

// ---------- Cabecera y raíz ----------

export const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>' // SEGURO (UTF-8)

export const ROOT = {
  name: 'ns2:peticion', // SEGURO
  namespaceAttribute: 'xmlns:ns2', // SEGURO
  namespace: 'http://www.neg.hospedajes.mir.es/altaParteHospedaje', // SEGURO
}

// peticion > solicitud > comunicacion > (contrato, persona, persona…)
export const REQUEST_NODE = 'solicitud' // BORRADOR
export const COMMUNICATION_NODE = 'comunicacion' // BORRADOR

// Comentarios que se escriben dentro del archivo para el propietario (sin datos personales).
export const PARTIAL_NOTE =
  'Archivo PARCIAL generado por el huesped en la web de Can Vauma. ' +
  'El propietario lo completa y lo valida antes de enviarlo a SES.HOSPEDAJES. ' +
  'BORRADOR: estructura orientativa segun el documento de diseno v1.1.0.'
export const OWNER_DATA_NOTE =
  'Faltan los datos fijos del propietario (se anaden al unir, Bloque 6): ' +
  'codigoEstablecimiento, pago (PLATF), horas de entrada y salida, numHabitaciones e internet.'

// ---------- Contrato (estancia) ----------

export const CONTRACT_NODE = 'contrato' // SEGURO

// Orden de los nodos dentro de <contrato>. required: si falta, no se genera el archivo.
// Fechas sin hora (AAAA-MM-DD): las horas las pone el propietario.
export type ContractKey =
  | 'reference'
  | 'contractDate'
  | 'checkInDate'
  | 'checkOutDate'
  | 'numberOfPeople'
export const CONTRACT_FIELDS: { key: ContractKey; node: string; required: boolean }[] = [
  { key: 'reference', node: 'referencia', required: true }, // BORRADOR
  { key: 'contractDate', node: 'fechaContrato', required: false }, // BORRADOR (solo si existe)
  { key: 'checkInDate', node: 'fechaEntrada', required: true }, // BORRADOR
  { key: 'checkOutDate', node: 'fechaSalida', required: true }, // BORRADOR
  { key: 'numberOfPeople', node: 'numPersonas', required: true }, // BORRADOR
]

// ---------- Personas ----------

// Cada persona es un <persona> dentro de <comunicacion>, después de <contrato>.
export const PERSON_NODE = 'persona' // BORRADOR

// Etiqueta del número de documento: en UN SOLO SITIO.
// Si el portal rechaza 'numeroDocumento', cambiar aquí a la alternativa 'documento'.
export const DOCUMENT_NUMBER_NODE = 'numeroDocumento' // BORRADOR (alternativa: 'documento')

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
  | 'contact'
  | 'relationship'
export const PERSON_FIELDS: { key: PersonKey; node: string; required: boolean }[] = [
  { key: 'role', node: 'rol', required: true }, // BORRADOR (nombre); código VI SEGURO
  { key: 'firstName', node: 'nombre', required: true }, // BORRADOR
  { key: 'surname1', node: 'apellido1', required: true }, // BORRADOR
  { key: 'surname2', node: 'apellido2', required: false }, // BORRADOR
  // Documento: opcional en el XML (los menores pueden no tenerlo; la regla está en rules.ts)
  { key: 'documentType', node: 'tipoDocumento', required: false }, // BORRADOR (nombre)
  { key: 'documentNumber', node: DOCUMENT_NUMBER_NODE, required: false },
  { key: 'supportNumber', node: 'soporteDocumento', required: false }, // BORRADOR
  { key: 'birthDate', node: 'fechaNacimiento', required: true }, // BORRADOR
  // Sexo y nacionalidad: opcionales en la plantilla; el XML los omite si faltan
  // (el formulario los exige por decisión del propietario).
  { key: 'nationality', node: 'nacionalidad', required: false }, // BORRADOR (nombre)
  { key: 'sex', node: 'sexo', required: false }, // BORRADOR (nombre)
  { key: 'address', node: 'direccion', required: true }, // BORRADOR (bloque)
  { key: 'contact', node: 'contacto', required: false }, // BORRADOR (bloque)
  { key: 'relationship', node: 'parentesco', required: false }, // BORRADOR (solo menores)
]

// Dirección de cada persona (dentro de 'direccion').
export type AddressKey = 'street' | 'complement' | 'city' | 'postalCode' | 'country'
export const ADDRESS_FIELDS: { key: AddressKey; node: string; required: boolean }[] = [
  { key: 'street', node: 'direccion', required: true }, // BORRADOR
  { key: 'complement', node: 'direccionComplementaria', required: false }, // BORRADOR
  // Municipio: texto por ahora. En España, código INE cuando tengamos la lista (pendiente).
  { key: 'city', node: 'nombreMunicipio', required: true }, // BORRADOR
  { key: 'postalCode', node: 'codigoPostal', required: true }, // BORRADOR
  { key: 'country', node: 'pais', required: true }, // BORRADOR (nombre); alfa-3 SEGURO
]

// Contacto de cada persona (dentro de 'contacto').
export type ContactKey = 'phone' | 'phone2' | 'email'
export const CONTACT_FIELDS: { key: ContactKey; node: string; required: boolean }[] = [
  { key: 'phone', node: 'telefono', required: false }, // BORRADOR (móvil)
  { key: 'phone2', node: 'telefono2', required: false }, // BORRADOR (fijo)
  { key: 'email', node: 'correo', required: false }, // BORRADOR (máx. 50 caracteres)
]

// ---------- Tablas de códigos ----------

// Rol: todas las personas llevan VI (documento de diseño). No hay TI en el XML del huésped.
export const PERSON_ROLE = 'VI' // SEGURO

// Tipo de documento (documento de diseño): NIF, NIE, PAS u OTRO.
export const DOCUMENT_CODES: Record<DocumentType, string> = {
  dni: 'NIF',
  nie: 'NIE',
  pasaporte: 'PAS',
  otro: 'OTRO',
}

// Sexo (documento de diseño): H, M u O.
export const SEX_CODES: Record<Sex, string> = {
  hombre: 'H',
  mujer: 'M',
  otro: 'O',
}

// Parentesco: el valor interno YA es el código del documento de diseño
// (src/domain/relationships.ts: AB, BA, BN…). Se escribe tal cual.
// El significado de cada código (etiquetas) está por confirmar.

// Datos fijos del propietario para el Bloque 6 (NO van en el archivo del huésped):
// pago PLATF, código de establecimiento, horas, numHabitaciones (PROPERTY.rooms)
// e internet (PROPERTY.internet).
export const OWNER_PAYMENT_TYPE = 'PLATF' // para el Bloque 6
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

// Fechas simples: AAAA-MM-DD (SEGURO). El archivo del huésped solo lleva fechas simples.
// Fechas con hora (las añade el propietario en el Bloque 6): la plantilla dice
// AAAA-MM-DDThh:mm:ss y la FAQ pública añade el desfase (+02:00): por confirmar.
// Desfase de España peninsular y Baleares: +01:00 en invierno y +02:00 en verano.
export const TIME_ZONE = 'Europe/Madrid'
