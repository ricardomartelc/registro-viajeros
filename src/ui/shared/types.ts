import type { IconName } from './icons'

// Tipos compartidos por las piezas de interfaz.

// Una opción de ChipGroup o de FloatingBar.
export interface Option {
  value: string
  label: string
  icon?: IconName
}

// Una fila de SummaryCard: etiqueta a la izquierda, valor a la derecha.
export interface SummaryRow {
  label: string
  value: string
}
