# Pendiente de confirmar con el ministerio

Control de lo que falta por confirmar en SES.HOSPEDAJES. Cada punto está marcado en el
código ("por confirmar" o "BORRADOR"); al confirmarlo, cambiar el código, quitar la marca
y tachar aquí. En "Dónde" se indica el archivo y lo que hay que buscar en él.

**Fuentes que tenemos:**
- **Documento de diseño** (plantilla oficial v1.1.0): roles, códigos de documento, sexo y
  parentesco, obligatoriedad de campos y estructura orientativa del XML.
- **Formulario en papel del propietario**: qué pide hoy en la casa.
- **FAQ pública** del portal.
- **Todavía NO tenemos el XSD**, que tendrá la última palabra (irá en `docs/ministerio/`).

## Confirmado con el documento de diseño (v1.1.0)

- Todas las personas llevan rol **VI** en el XML (no hay TI). En la interfaz, la primera
  persona se sigue llamando "titular".
- Tipo de documento: **NIF, NIE, PAS u OTRO**. Sexo: **H, M u O**. Países y nacionalidades
  en **ISO alfa-3**.
- Documento (tipo y número) obligatorio solo para **mayores de 18** a la fecha de entrada.
- Segundo apellido obligatorio si el documento es **DNI/NIF**.
- Correo de **50 caracteres como máximo**.
- Parentesco con los códigos **AB, BA, BN, CD, CY, HJ, HR, NI, PM, SB, SG, TI, YN, TU, OT**.
- Forma de pago fija del propietario: **PLATF** (no la rellena el huésped).

## Confirmado con el formulario en papel del propietario

- **Sexo y nacionalidad**: la plantilla los marca opcionales, pero nuestro formulario los
  exige (el formulario en papel los marca como obligatorios). El XML los omite si faltan.
- **Teléfono móvil obligatorio**; teléfono fijo y correo opcionales.
- **Máximo 6 personas** por reserva (capacidad de la casa).
- Las **horas de entrada y salida** y la forma de pago son datos fijos del propietario.

## Por confirmar: significado de los códigos

| Pendiente | Valor actual | Dónde |
|---|---|---|
| Significado de cada código de parentesco (nuestra mejor lectura: AB abuelo/a, BA bisabuelo/a, BN bisnieto/a, CD cuñado/a, CY cónyuge, HJ hijo/a, HR hermano/a, NI nieto/a, PM padre/madre, SB sobrino/a, SG suegro/a, TI tío/a, YN yerno/nuera, TU tutor/a, OT otro, incluye primo/a) | Etiquetas provisionales en ES y EN | `src/domain/relationships.ts`, `src/i18n/es.ts` y `en.ts` (`relationship.*`) |
| **¿Dónde va el parentesco: en el menor o en el adulto?** | En el menor: "qué es el menor respecto a un adulto" (p. ej. HJ) | `src/xml/schema.ts` (`relationship`), `src/i18n/es.ts` (`person.relationshipHint`) |

## Por confirmar: campos obligatorios y reglas

| Pendiente | Valor actual | Dónde |
|---|---|---|
| ¿Domicilio obligatorio (dirección, municipio, código postal, país) para todos, menores incluidos? | Sí, para todos; el complemento es opcional | `src/domain/validateBooking.ts` (`Domicilio`) |
| ¿El móvil es obligatorio también para los menores? | Sí, para todos. Los acompañantes pueden usar el contacto del titular (casilla marcada por defecto) | `src/domain/rules.ts` (`mobileRequired`), `src/ui/guest/CompanionScreen.vue` |
| Si el contacto se copia del titular, ¿se acepta el mismo teléfono o correo para varias personas? | Sí, se copia tal cual | `src/ui/guest/bookingState.ts` (`applySharedData`) |
| ¿El número de personas debe coincidir con la lista? | Sí | `src/domain/rules.ts` (`peopleCountMustMatch`) |
| ¿Debe haber al menos un adulto en la reserva? | Sí | `src/domain/rules.ts` (`atLeastOneAdult`) |
| Documentos que llevan número de soporte | DNI y NIE | `src/domain/rules.ts` (`supportNumberRequiredFor`) |
| Código postal español con provincia 01 a 52 | Sí | `src/domain/rules.ts` (`checkSpanishProvince`) |
| Nacidos el 29 de febrero, en año no bisiesto | Cumplen el 1 de marzo (prudente) | `src/domain/dates.ts` (`ageOn`) |
| Fecha del contrato: no futura y no posterior a la entrada | Así se valida (es opcional) | `src/domain/validators/dates.ts` (`validateContractDate`) |

## Por confirmar: longitudes

| Pendiente | Valor actual | Dónde |
|---|---|---|
| Longitud máxima de nombre y apellidos | Sin límite | `src/domain/validators/names.ts` |
| Longitud máxima del número de documento | Sin límite | `src/domain/validators/documents.ts` |

## Municipios (INE)

| Pendiente | Valor actual | Dónde |
|---|---|---|
| **Lista de municipios del INE**: si el país es España, sustituir el municipio en texto por un buscador que guarde el código INE | Municipio en texto libre para todos los países | `src/domain/types.ts` (`Address.city`), `src/xml/schema.ts` (`nombreMunicipio`) |

## Datos del propietario (Bloque 6: unión de archivos)

No van en el archivo del huésped; los añade el propietario al unir.

| Dato | Valor | Dónde |
|---|---|---|
| Código de establecimiento | Lo pone el propietario | Bloque 6 |
| Forma de pago | `PLATF` | `src/xml/schema.ts` (`OWNER_PAYMENT_TYPE`) |
| Horas de entrada y salida | Las pone el propietario | Bloque 6 |
| Número de habitaciones (`PROPERTY.rooms`) e internet (`PROPERTY.internet`) | No existen todavía en el código; se crearán en el Bloque 6 | Bloque 6 |
| **Fecha de tarjeta MM/AAAA** (la plantilla la incluye) | Pendiente: con pago PLATF, ¿hace falta? | Bloque 6 |

## Fechas con hora

| Pendiente | Valor actual | Dónde |
|---|---|---|
| **Formato de fecha con hora**: la plantilla dice `AAAA-MM-DDThh:mm:ss` y la FAQ pública añade el desfase (`+02:00`). ¿Cuál acepta el portal? | El archivo del huésped ya no lleva horas. Para el Bloque 6 está preparado `AAAA-MM-DDThh:mm:ss+01:00/+02:00` (Europe/Madrid) | `src/xml/timeZone.ts`, `src/xml/schema.ts` (`TIME_ZONE`) |

## XML parcial: estructura BORRADOR

Todo está en `src/xml/schema.ts`; al llegar el XSD, solo se cambia ese archivo (y el archivo de
oro `src/__tests__/fixtures/parte-3-personas.xml`, revisando el cambio).

**Seguro:** raíz `<ns2:peticion>` con su espacio de nombres; UTF-8; fechas AAAA-MM-DD; rol VI;
códigos NIF/NIE/PAS/OTRO, H/M/O y de parentesco; países en alfa-3.

| BORRADOR (estructura orientativa del documento de diseño) | Valor provisional |
|---|---|
| Nodos intermedios | `peticion` > `solicitud` > `comunicacion` > `contrato` y cada `persona` |
| Nodos del contrato | `referencia`, `fechaContrato` (solo si existe), `fechaEntrada`, `fechaSalida`, `numPersonas` |
| Nodos de cada persona y su orden | `rol`, `nombre`, `apellido1`, `apellido2`, `tipoDocumento`, `numeroDocumento`, `soporteDocumento`, `fechaNacimiento`, `nacionalidad`, `sexo`, `direccion`, `contacto`, `parentesco` |
| **Etiqueta del número de documento** | `numeroDocumento`; si el portal la rechaza, cambiar a `documento` en un único sitio (`DOCUMENT_NUMBER_NODE`) |
| Dirección (hoy se repite `direccion` dentro de `direccion`) | `direccion` > `direccion`, `direccionComplementaria`, `nombreMunicipio`, `codigoPostal`, `pais` |
| Contacto | `contacto` > `telefono` (móvil), `telefono2` (fijo), `correo` |
| Si los menores sin documento deben llevar algún nodo especial | Se omiten los nodos de documento |
| Formato del teléfono en el XML (¿con prefijo, sin espacios?) | Tal como lo escribe el huésped |

**Validación contra el XSD (pendiente):** cuando exista el XSD, hay que comprobar el archivo de
oro y los XML generados contra él. Pregunta abierta: ¿cómo validar un XSD en Node **sin añadir
librerías** al proyecto? (Node no lo trae; opción a valorar: una herramienta externa fuera del
proyecto, como `xmllint`, usada solo a mano o en la integración continua.)

## Archivo y envío

| Pendiente | Valor actual | Dónde |
|---|---|---|
| Nombre del archivo que espera el propietario o el portal | `parte_<localizador>.xml` (decisión propia) | `src/export/buildPartialFile.ts` |
| Dirección real de recepción del propietario | Ejemplo `registro@ejemplo.invalid`; la real irá en la variable de entorno `VITE_RECEPTION_EMAIL` (archivo `.env.local`, que no se sube) | `src/config.ts` |
| ¿Qué debe poner el asunto del correo? | "El localizador de su reserva" (decisión provisional del propietario) | `src/i18n/es.ts` (`final.step2Text`) |

## Textos por revisar jurídicamente

No son del ministerio, pero tienen efecto legal: revisarlos antes de publicar.

| Texto | Dónde |
|---|---|
| Casilla de Revisar: "Confirmo que los datos son correctos y que estoy autorizado a facilitar los de las demás personas." | `src/i18n/es.ts` y `en.ts` (`review.confirm`) |
| Nota de privacidad de la pantalla Final: "Sus datos no se guardan en ningún servidor." | `src/i18n/es.ts` y `en.ts` (`final.privacy`) |
| Aviso de privacidad completo (el enlace de la bienvenida aún no tiene destino) | `src/ui/guest/WelcomeScreen.vue` |
