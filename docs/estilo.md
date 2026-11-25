# Estilo de la web del huésped

## Dirección: ficha de catálogo
- Una foto nítida arriba y el formulario sobre papel marfil. Líneas finas, aire, sensación de folleto de casa real.
- Descartado: recorrido animado por la casa, vídeo generado con IA, paneles de cristal sobre fotos desenfocadas (parecen hechos con IA), fondos oscuros y degradados de web de empresa.
- Objetivo: transmitir confianza y que se note que los dueños han dedicado tiempo a la web. Vistosa pero sobria.

## Sensación
- Tipo iOS: agradable y profesional. Títulos grandes, listas agrupadas con filas redondeadas, chips para elegir opciones, esquinas medias, transiciones suaves.
- Tipografía del sistema para el cuerpo (en iPhone sale la de Apple). Títulos en Fraunces (instalada con npm, sin Google Fonts, por privacidad en la UE).

## Color (en `src/assets/tokens.css`)
- Papel marfil `#F7F3EC`, tinta marrón `#3B2F2A`, líneas `#D9CDBD`.
- Botón principal: rojo tipo Airbnb `#E31C5F` con texto blanco (cumple contraste AA). Un solo botón principal por pantalla.
- Turquesa `#0F7F86` solo para enlaces.

## Cristal
- Botones y barras semitransparentes tipo iOS, solo sobre fotos: selector ES/EN, barra flotante. Sobre el papel marfil se ve lavado: allí el botón principal va relleno.

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

## Pantallas del huésped
Bienvenida · Estancia · Datos (por persona) · Acompañantes · Revisar · Final.

## Pendiente
- Foto de la puerta de entrada y originales de todas las fotos (las actuales vienen de WhatsApp).
- Elegir idiomas más allá de ES y EN.
