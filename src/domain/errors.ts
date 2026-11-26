// Códigos de error de las validaciones. Nunca son textos para el usuario:
// el texto de cada código sale de src/i18n (claves 'error.<código>').
// Es una lista (y no solo un tipo) para que un test compruebe que todos tienen texto.
export const ERROR_CODES = [
  'campo.obligatorio',
  // Documentos
  'dni.formato',
  'dni.letraIncorrecta',
  'nie.formato',
  'nie.letraIncorrecta',
  'documento.formato',
  // Fechas y horas
  'fecha.formato',
  'fecha.noExiste',
  'hora.formato',
  'nacimiento.futuro',
  'salida.noPosterior',
  // Formatos
  'cp.formato',
  'cp.provincia',
  'nombre.caracteres',
  'telefono.formato',
  'correo.formato',
  'personas.formato', // número de personas vacío o que no es un entero de 1 o más
  // Reglas por edad o tipo de documento (ver rules.ts)
  'documento.obligatorio',
  'soporte.obligatorio',
  'parentesco.obligatorio',
  'contacto.obligatorio',
  // Reglas de la reserva completa
  'reserva.personasNoCoinciden',
  'reserva.sinAdulto',
] as const

export type ErrorCode = (typeof ERROR_CODES)[number]
