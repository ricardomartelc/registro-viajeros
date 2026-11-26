// Formas de pago: valores INTERNOS. Los códigos del ministerio están por confirmar
// con la plantilla del ministerio (ver docs/pendiente-ministerio.md).
export const PAYMENT_METHODS = ['tarjeta', 'transferencia', 'efectivo', 'otro'] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]
