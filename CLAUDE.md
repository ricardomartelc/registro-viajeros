# Can Vauma · Registro de viajeros

Web estática para que los huéspedes de la casa Can Vauma (Alcúdia, Mallorca) rellenen sus datos y descarguen un XML parcial. El propietario junta los XML por reserva, los valida y descarga el final para SES.HOSPEDAJES (Ministerio del Interior, RD 933/2021).

## Quién trabaja aquí
- Persona con nivel junior en programación, estudiante de ingeniería de telecomunicación. Explica los cambios en lenguaje claro y escribe código lo más simple y legible posible.
- Antes de modificar un archivo que ya existe, enseña el cambio y espera confirmación. Los archivos nuevos se pueden crear.
- Propón un plan corto antes de tareas de más de 2 o 3 archivos.

## Stack
- Vue 3 + TypeScript + Vite. Tests con Vitest. ESLint, oxlint y Prettier.
- No añadir Router, Pinia, JSX, ni E2E. No instalar librerías nuevas sin preguntar.
- Comandos: `npm run dev`, `npm run test:unit`, `npm run lint`, `npm run type-check`, `npm run build`.

## Capas (la interfaz solo depende de las capas de abajo)
`src/domain` (datos y validaciones) · `src/xml` (generar y leer XML) · `src/export` (descargas) · `src/i18n` (textos ES/EN) · `src/ui/guest` (pantallas del huésped) · `src/ui/owner` (pantalla del propietario) · `src/ui/shared` (piezas comunes) · `src/assets` (variables de diseño y fotos).

## Reglas importantes
- Este repositorio es PÚBLICO. Nunca subir datos reales de huéspedes, certificados, claves ni correos reales. Usar solo datos inventados.
- Los datos del huésped no se guardan en ningún servidor: todo ocurre en el navegador.
- Los textos visibles van siempre por `src/i18n`, no escritos dentro de los componentes.
- Trato de "usted" en los textos en español. Tono claro y sereno.
- Accesibilidad: etiquetas visibles en cada campo, errores con texto (no solo color), botones de 44 px o más, foco visible.
- Fotos: sin metadatos EXIF. No publicar fotos que muestren la dirección.
- Commits con el correo no-reply de GitHub (ya configurado en este repositorio).

## Estilo
Lee `docs/estilo.md` antes de tocar la interfaz. Todos los colores, tipografías, espacios y radios salen de `src/assets/tokens.css`: no escribir valores sueltos en los componentes.
Antes de crear o cambiar una pantalla, mira las imágenes de referencias/ y respeta docs/estilo.md.
