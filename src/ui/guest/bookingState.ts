import { reactive, ref, watch } from 'vue'
import { emptyBooking, emptyPerson } from '../../domain/create'
import { RULES } from '../../domain/rules'
import type { Booking } from '../../domain/types'
import { clearDraft, loadDraft, saveDraft, storageWorks } from './draft'
import { clearFormFlags, emptyFormFlags, loadFormFlags, saveFormFlags } from './formDraft'

// Estado de la reserva que va rellenando el huésped, compartido por todas las pantallas.
// Empieza con el borrador guardado (si lo hay) y se guarda solo en cada cambio.
export const booking = reactive<Booking>(loadDraft() ?? emptyBooking())

// false si el navegador no deja guardar: la pantalla avisa de que no cierre la página.
export const storageAvailable = ref(storageWorks())

watch(
  booking,
  (value) => {
    storageAvailable.value = saveDraft(value)
  },
  { deep: true },
)

// Casillas "Mismo domicilio" / "Usar el contacto del titular" de cada acompañante.
// Se guardan aparte del borrador de la reserva (formDraft.ts). Por defecto, marcadas.
export const formFlags = reactive(loadFormFlags())
watch(formFlags, (value) => saveFormFlags(value), { deep: true })

export const sameAddressFor = (index: number): boolean => formFlags.sameAddress[index] ?? true
export const sameContactFor = (index: number): boolean => formFlags.sameContact[index] ?? true

// Al marcar, se copian los datos del titular. Al desmarcar, se vacían los copiados:
// los campos aparecen en blanco para que la persona escriba los suyos.
export function setSameAddress(index: number, value: boolean): void {
  formFlags.sameAddress[index] = value
  if (!value) booking.people[index]!.address = emptyPerson().address
  applySharedData()
}

export function setSameContact(index: number, value: boolean): void {
  formFlags.sameContact[index] = value
  if (!value) {
    booking.people[index]!.phone = ''
    booking.people[index]!.phone2 = ''
    booking.people[index]!.email = ''
  }
  applySharedData()
}

// Copia el domicilio y el contacto del titular a los acompañantes con la casilla marcada.
export function applySharedData(): void {
  const holder = booking.people[0]!
  booking.people.forEach((person, index) => {
    if (index === 0) return
    if (sameAddressFor(index)) person.address = { ...holder.address }
    if (sameContactFor(index)) {
      person.phone = holder.phone
      person.phone2 = holder.phone2
      person.email = holder.email
    }
  })
}

// Deja la lista con 'count' personas (de 1, el titular, a 6, el máximo de rules.ts):
// añade vacías o quita las últimas.
export function syncPeopleCount(count: number): void {
  const wanted = Math.min(Math.max(1, count), RULES.maxPeople)
  while (booking.people.length < wanted) booking.people.push(emptyPerson())
  booking.people.splice(wanted)
  formFlags.sameAddress.splice(wanted)
  formFlags.sameContact.splice(wanted)
}

// Solo añade las personas que falten según "Número de personas" (nunca borra).
export function ensurePeopleCount(): void {
  if (booking.stay.numberOfPeople > booking.people.length) {
    syncPeopleCount(booking.stay.numberOfPeople)
  }
}

// Ajusta el número de acompañante a uno que exista: entre 1 y el último.
// (Si no hay acompañantes devuelve 1; App.vue ya no deja entrar en ese caso.)
export function clampCompanion(index: number): number {
  const last = Math.max(1, booking.people.length - 1)
  return Math.min(Math.max(1, index), last)
}

// Posiciones de los acompañantes que se borrarían al dejar 'count' personas
// y que ya tienen algo escrito por la persona (lo copiado del titular no cuenta).
export function companionsWithData(count: number): number[] {
  const result: number[] = []
  for (let index = Math.max(1, count); index < booking.people.length; index++) {
    const p = booking.people[index]!
    const own: string[] = [
      p.firstName,
      p.surname1,
      p.surname2,
      p.sex,
      p.birthDate,
      p.nationality,
      p.documentType,
      p.documentNumber,
      p.supportNumber,
      p.relationship,
    ]
    if (!sameAddressFor(index)) own.push(...Object.values(p.address))
    if (!sameContactFor(index)) own.push(p.phone, p.phone2, p.email)
    if (own.some((value) => value !== '')) result.push(index)
  }
  return result
}

// Navegación desde Revisar:
// - returnToReview ("volverARevisar"): se ha pulsado "Cambiar" o un error en Revisar.
//   "Siguiente" en la pantalla editada vuelve directamente a Revisar. Se borra al llegar.
// - focusField: id del campo al que llevar el foco al abrir la pantalla (enlace de un error).
//   Mientras está puesto, la pantalla enseña sus errores desde el principio.
export const reviewNav = reactive({
  returnToReview: false,
  focusField: null as string | null,
})

// Casilla de confirmación de Revisar, marcada al pulsar "Continuar". La pantalla Final la exige.
export const confirmed = ref(false)

// Aviso "Sus datos se han borrado." en la bienvenida, tras borrar desde la pantalla Final.
export const dataCleared = ref(false)

// "Borrar mis datos": vacía el formulario, las casillas y lo guardado.
export function resetBooking(): void {
  const fresh = emptyBooking()
  booking.stay = fresh.stay
  booking.people = fresh.people
  Object.assign(formFlags, emptyFormFlags())
  confirmed.value = false
  reviewNav.returnToReview = false
  reviewNav.focusField = null
  clearDraft()
  clearFormFlags()
}

// Fecha de hoy en hora local, como 'AAAA-MM-DD' (para validar la fecha de nacimiento).
export function localToday(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}
