import { ref } from 'vue'
import { es } from './es'
import { en } from './en'

// Idiomas disponibles. Para añadir uno: crear su archivo y sumarlo aquí.
export type Locale = 'es' | 'en'
export const LOCALES: Locale[] = ['es', 'en']

// Nombre de cada idioma escrito en ese mismo idioma.
export const LOCALE_NAMES: Record<Locale, string> = { es: 'Español', en: 'English' }

// Claves válidas: las de es.ts. Si se escribe una clave que no existe, TypeScript avisa.
export type MessageKey = keyof typeof es

const messages: Record<Locale, Record<MessageKey, string>> = { es, en }

// Idioma actual. Es reactivo: al cambiarlo, los textos de la pantalla se actualizan solos.
export const locale = ref<Locale>('es')

// Devuelve el texto de una clave en el idioma actual. Uso: t('welcome.start')
export function t(key: MessageKey): string {
  return messages[locale.value][key]
}

// Cambia el idioma y avisa al navegador (lo usan los lectores de pantalla).
export function setLocale(newLocale: Locale): void {
  locale.value = newLocale
  document.documentElement.lang = newLocale
}
