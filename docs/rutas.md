# Rutas de la web

Direcciones de cada pantalla, en el orden en que las recorre un huésped.

## En el ordenador

Con `npm run dev` (Vite dice el puerto al arrancar; aquí se usa `5174` como ejemplo):

| # | Pantalla | Dirección |
|---|---|---|
| 0 | Bienvenida | http://localhost:5174/ |
| 1 | Estancia | http://localhost:5174/#estancia |
| 2 | Sus datos (titular) | http://localhost:5174/#datos |
| 3 | Acompañantes | http://localhost:5174/#acompanantes |
| 4 | Revisar | http://localhost:5174/#revisar |
| 5 | Final (descarga) | http://localhost:5174/#final |
| — | Muestra de piezas (solo desarrollo) | http://localhost:5174/?muestra=1 |

## En el móvil

1. En el ordenador: `npm run dev -- --host`.
2. Vite enseña una línea **Network**, por ejemplo `http://192.168.1.50:5175/`.
3. En el móvil (misma wifi), abra esa dirección y añada la terminación de la tabla:
   por ejemplo `http://192.168.1.50:5175/#revisar`.

## Notas

- **Acompañantes:** todos comparten la dirección `#acompanantes`. Se pasa de uno a otro con
  "Siguiente" y "Atrás" (o con el "atrás" del móvil). Para que haya acompañantes, ponga 2 o
  más en "Número de personas" de Estancia. Sin acompañantes, `#acompanantes` lleva a `#datos`.
- **Modo pruebas (ahora activado con `npm run dev`):** se puede ir adelante y atrás aunque
  falten datos o haya errores, y entrar a mano en cualquier dirección. Arriba de cada pantalla
  sale el aviso "Modo pruebas". Los errores se siguen viendo, pero no bloquean.
  - En la versión final (`npm run build`) está **siempre apagado**: se exigen los datos.
  - Para probar ya el comportamiento final con `npm run dev`, cree el archivo `.env.local`
    (no se sube a GitHub) con la línea `VITE_NAVEGACION_LIBRE=false` y reinicie el servidor.
  - Se configura en `src/config.ts` (`FREE_NAVIGATION`).
- **Comportamiento final (modo pruebas apagado):** si entra a mano en una dirección sin los
  datos necesarios, la web le lleva a la pantalla que toca:
  - `#revisar`: sin estancia válida → `#estancia`; sin titular válido → `#datos`.
  - `#final`: sin marcar la casilla de Revisar, o con algún error → `#revisar`.
- **Empezar de cero:** botón "Borrar mis datos" (arriba de cada formulario o en el paso 3
  de Final). Lo escrito solo se guarda en esa pestaña del navegador.
