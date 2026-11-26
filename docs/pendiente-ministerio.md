# Pendiente de confirmar con el ministerio

Control para cuando lleguen la plantilla XML, el XSD y el documento de instrucciones
de SES.HOSPEDAJES. Cada punto está marcado en el código; al confirmarlo, cambiar el
código, quitar la marca y tachar aquí.

Aún no tenemos ninguno de los tres documentos: nada de esta lista se ha deducido de ellos.

## Campos obligatorios

| Pendiente | Valor actual | Dónde |
|---|---|---|
| ¿Domicilio obligatorio (los cuatro campos) para todas las personas, menores incluidos? | Sí, para todos | `src/domain/validateBooking.ts:167` |
| ¿Teléfono o correo obligatorio? ¿Es obligatorio el contacto de los menores? | Al menos uno de los dos, para todos (menores incluidos). Los acompañantes pueden usar el contacto del titular (casilla marcada por defecto) | `src/domain/rules.ts:20-22`, `src/ui/guest/CompanionScreen.vue` |
| Si el contacto se copia del titular, ¿se acepta el mismo teléfono o correo para varias personas? | Sí, se copia tal cual | `src/ui/guest/bookingState.ts` (`applySharedData`) |
| ¿El número de personas de la estancia debe coincidir con la lista? | Sí | `src/domain/rules.ts:14-15` |
| ¿Debe haber al menos un adulto en la reserva? | Sí | `src/domain/rules.ts:16-17` |

## Códigos

| Pendiente | Valor actual | Dónde |
|---|---|---|
| Traducción de los valores internos a los códigos del ministerio (países, sexo, tipo de documento, parentesco); se hará en `src/xml` | Valores internos | `src/domain/types.ts:7` |
| Códigos de sexo | `'hombre' \| 'mujer' \| 'otro'` | `src/domain/types.ts:12` |
| Formato de país del domicilio: ISO alfa-2 (`ES`) o alfa-3 (`ESP`) | Código interno ISO alfa-2, elegido en una lista | `src/domain/types.ts:19`, `src/domain/countries.ts:2-3` |
| Formato de la nacionalidad (igual que el país) | Código interno ISO alfa-2, elegido en una lista | `src/domain/types.ts:29` |
| Detección de España mientras no se sepa el formato | Acepta `ES` y `ESP` | `src/domain/rules.ts:25` |
| Lista de valores de parentesco | Texto libre | `src/domain/types.ts:38` |

## Longitudes

| Pendiente | Valor actual | Dónde |
|---|---|---|
| Longitud máxima de nombre y apellidos | Sin límite | `src/domain/validators/names.ts:6` |
| Longitud máxima del número de documento (pasaporte y otros) | Sin límite | `src/domain/validators/documents.ts:35` |

## Pago

| Pendiente | Valor actual | Dónde |
|---|---|---|
| Campos de pago y si son obligatorios | `Payment { method, date?, holder? }`, opcional | `src/domain/types.ts:42` |
| Formas de pago y sus códigos | Valores internos: `tarjeta`, `transferencia`, `efectivo`, `otro` | `src/domain/payment.ts:1-3` |
| Validación del pago | Sin validar | `src/domain/validateBooking.ts:110` |
| **Fecha de tarjeta en formato MM/AAAA** (sabemos que la plantilla la incluye) | **No está en el modelo ni en la pantalla todavía** | — |

## Reglas por edad y por tipo de documento

Todas en `src/domain/rules.ts` (línea 4: "TODAS por confirmar con el XSD del ministerio").

| Pendiente | Valor actual | Dónde |
|---|---|---|
| Edad adulta | 18 | `src/domain/rules.ts:6-7` |
| Edad desde la que el documento es obligatorio | 14 | `src/domain/rules.ts:8-9` |
| Documentos que llevan número de soporte | DNI y NIE | `src/domain/rules.ts:10-11` |
| Parentesco obligatorio para menores | Sí | `src/domain/rules.ts:12-13` |
| Código postal español con provincia 01 a 52 | Sí | `src/domain/rules.ts:18-19` |
| Nacidos el 29 de febrero, en año no bisiesto | Cumplen el 1 de marzo (prudente) | `src/domain/dates.ts:53` |

## Archivo y envío

| Pendiente | Valor actual | Dónde |
|---|---|---|
| Generar el XML parcial (nombre del archivo, estructura, codificación) según la plantilla y el XSD | No implementado: devuelve "noImplementado"; el botón "Descargar archivo" está desactivado | `src/export/buildPartialFile.ts` |
| Dirección real de recepción del propietario | Ejemplo `registro@ejemplo.invalid`; la real irá en la variable de entorno `VITE_RECEPTION_EMAIL` (archivo `.env.local`, que no se sube) | `src/config.ts` |
| ¿Qué debe poner el asunto del correo? | "El localizador de su reserva" (decisión provisional del propietario) | `src/i18n/es.ts` (`final.step2Text`) |

## Textos por revisar jurídicamente

No son del ministerio, pero tienen efecto legal: revisarlos antes de publicar.

| Texto | Dónde |
|---|---|
| Casilla de Revisar: "Confirmo que los datos son correctos y que estoy autorizado a facilitar los de las demás personas." | `src/i18n/es.ts` y `en.ts` (`review.confirm`) |
| Nota de privacidad de la pantalla Final: "Sus datos no se guardan en ningún servidor." | `src/i18n/es.ts` y `en.ts` (`final.privacy`) |
| Aviso de privacidad completo (el enlace de la bienvenida aún no tiene destino) | `src/ui/guest/WelcomeScreen.vue` |
