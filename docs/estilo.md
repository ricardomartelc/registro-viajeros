# Estilo de la web del huésped

## Dirección: ficha de catálogo
- Una foto nítida arriba y el formulario sobre papel marfil. Líneas finas, aire, sensación de folleto de casa real.
- Descartado: recorrido animado por la casa, vídeo generado con IA, paneles de cristal sobre fotos desenfocadas (parecen hechos con IA), fondos oscuros y degradados de web de empresa.
- Objetivo: transmitir confianza y que se note que los dueños han dedicado tiempo a la web. Vistosa pero sobria.

## Bienvenida elegida: A · Foto inmersiva
- Primera pantalla (100dvh): foto vertical de la casa a pantalla completa, nítida y sin velo grande. Arriba, sobre el cielo: "Can Vauma" y el selector ES/EN; debajo, el título enorme en Fraunces en dos líneas y la pastilla "Alcúdia · Mallorca". Abajo, sobre el seto: una píldora de cristal rojo "Comenzar" centrada.
- Al bajar, sobre papel marfil: la frase corta, "Cómo funciona" (3 pasos con icono), nota de privacidad y un botón "Comenzar" secundario (contorno).
- La foto de fondo (`plano-general-casa.jpg`) es una foto real ampliada con IA (cielo y parte inferior). Solo se usa como fondo de la bienvenida, no como foto de anuncio.
- El encuadre se ajusta con `--photo-welcome-position` en `tokens.css`. Si se cambia la foto o se mueve el texto, volver a medir el contraste a 320, 375 y 430 px.

## Velo sobre fotos
- Nada de velos grandes que oscurezcan la foto. Solo se permite un velo MUY suave arriba (`--overlay-sky`) para asegurar el contraste del texto sobre el cielo. El texto debe leerse en todos los móviles, también a 320 px.
- Si no se llega al contraste, se busca otro encuadre u otra foto; no se oscurece más.
- Siguen descartados los degradados decorativos de color.

## Sensación
- Tipo iOS: agradable y profesional. Títulos grandes, listas agrupadas con filas redondeadas, chips para elegir opciones, esquinas medias, transiciones suaves.
- Tipografía del sistema para el cuerpo (en iPhone sale la de Apple). Títulos en Fraunces (instalada con npm, sin Google Fonts, por privacidad en la UE).

## Color (en `src/assets/tokens.css`)
- Papel marfil `#F7F3EC`, tinta marrón `#3B2F2A`, líneas `#D9CDBD`.
- Botón principal: rojo tipo Airbnb `#E31C5F` con texto blanco (cumple contraste AA). Un solo botón principal rojo visible a la vez en la pantalla. Si la página es larga y repite el botón al final, nunca deben verse los dos juntos en el mismo móvil.
- Rojo suave `#DD3066` solo para el cristal rojo sobre fotos (al 75 %, sin borde, con texto de 1,2rem en negrita para que cuente como texto grande).
- Turquesa `#0C6E74` solo para enlaces (contraste AA sobre el marfil).

## Cristal
- Botones y barras semitransparentes tipo iOS, solo sobre fotos: selector ES/EN, barra flotante. Sobre el papel marfil se ve lavado: allí el botón principal va relleno.
- El cristal, incluido el rojo (`glass-accent`), solo se usa sobre fotos. Sobre marfil, el botón principal es rojo sólido (primary) solo si no se ve a la vez otro botón rojo; si no, va en contorno (outline).
- Botón principal sobre la foto: píldora de cristal rojo centrada, con flecha, nunca a ancho completo. Medir el contraste del texto con la foto detrás si cambia la foto.
- Sobre cielos claros, el cristal va tintado de oscuro (`--glass-bg-dark`): el cristal blanco aclara el fondo y el texto blanco pierde contraste.

## Movimiento (sutil)
- Los bloques aparecen al bajar con fundido y una subida corta, escalonados (`v-reveal`, ver `src/ui/shared/vReveal.ts`). Se desactiva con "reducir movimiento".
- Nada de animaciones largas ni de recorridos.

## Piezas e ideas de referencia
- Barra flotante en píldora con iconos (navegación inferior).
- Indicador de pasos con iconos unidos por una línea.
- Chips para tipo de documento, país y acompañantes; listas agrupadas con filas redondeadas.
- Pantalla Revisar: tarjeta de resumen con filas alternas.
- Pantalla final: foto nítida, nombre del archivo, tres pasos para enviarlo por correo y botón "Copiar asunto". Sin mostrar la dirección de correo.
- Foto a pantalla completa con titular en las pantallas de bienvenida y final.
- Patrones de formularios claros (fechas, errores, "Revisar sus respuestas") al estilo del GOV.UK Design System.

## Piezas y compatibilidad móvil
- Piezas comunes en `src/ui/shared`: AppButton, StepIndicator, LanguageSwitch, FloatingBar, ChipGroup, FormGroup + FormRow, TextField y SummaryCard. En desarrollo se ven todas juntas con `?muestra=1` (no llega a producción).
- Barra flotante: píldora de cristal claro con iconos, fija abajo. Sin `backdrop-filter`, fondo sólido (`@supports`). Las páginas que la usan dejan abajo un hueco de `--floating-bar-height`.
- Chips: por dentro son radios o casillas nativos. El elegido va relleno en tinta y con ✓ (no solo color).
- Listas agrupadas: tarjeta blanca con filas separadas por líneas finas, título pequeño en mayúsculas encima y nota debajo.
- Campos: etiqueta visible, ayuda, error con icono y texto, y borde rojo más grueso. Usan `autocomplete`, `inputmode` y `enterkeyhint` para que el móvil ayude a rellenar.
- Resumen (pantalla Revisar): filas alternas en blanco y marfil.

Compatibilidad móvil (iPhone y Android):
- Zonas táctiles de 44 px o más. Nada depende del hover: los efectos de hover van dentro de `@media (hover: hover)`.
- Letra de campos y chips de 16 px o más (`--text-base`). Con menos, el iPhone hace zoom al tocar.
- `100dvh` en las pantallas completas y `env(safe-area-inset-*)` en lo que toca los bordes.
- Fuentes e iconos locales (Fraunces instalada con npm e iconos SVG propios): nada se pide a servidores externos.
- Sin APIs ni estilos exclusivos de iOS o de Android: controles nativos del navegador. El cristal siempre tiene alternativa con `@supports`.
- Ninguna pieza fija una fuente propia: todas usan `--font-body` y `--font-display`.

## Revisar y Final
- Revisar sigue el patrón "Comprueba tus respuestas" de GOV.UK: una tarjeta de resumen (filas alternas blanco y marfil) por bloque (Estancia, Titular, cada Acompañante), con un botón "Cambiar" de contorno junto al título. Su nombre accesible dice qué cambia ("Cambiar acompañante 2").
- "Cambiar" (o un error) abre esa pantalla; "Siguiente" allí vuelve directamente a Revisar. Si se llega desde un error, el foco va al campo y los errores se ven desde el principio.
- Los errores salen arriba, con la persona o bloque y el campo ("Acompañante 2: Fecha de nacimiento: …"). La tarjeta con errores lleva borde rojo y un texto ("Hay datos por corregir en este bloque."). Con errores, "Continuar" queda desactivado y un texto explica por qué.
- Casilla de confirmación obligatoria antes de "Continuar" (botón rojo, único principal).
- Fechas legibles en el idioma elegido ("12 de julio de 2027") y cifras con `font-variant-numeric: tabular-nums`.
- Final: título "Casi listo" y tres pasos numerados grandes en una lista agrupada (descargar, enviar por correo, borrar los datos). Sin aviso de guardado arriba: el borrado es el paso 3. En el indicador, todos los pasos completados.
- Paso 1 de Final: "Descargar archivo" es el único botón rojo; si el móvil permite compartir archivos, debajo aparece "Compartir archivo" en contorno. Una ayuda plegable (`<details>`, línea de 44 px) explica qué hacer en iPhone si el archivo se abre en pantalla. El resultado se anuncia con texto ("Archivo descargado.").
- La dirección de correo se muestra entera y seleccionable; "Copiar dirección" confirma con texto, y si el navegador no deja copiar, la enseña en un campo ya seleccionado.
- Títulos con `text-wrap: balance`, párrafos con `text-wrap: pretty` y textos largos de 65 caracteres como máximo por línea.

## Pantallas del huésped
Bienvenida · Estancia · Datos (por persona) · Acompañantes · Revisar · Final.

## Pendiente
- Foto de la puerta de entrada y originales de todas las fotos (las actuales vienen de WhatsApp).
- Elegir idiomas más allá de ES y EN.
