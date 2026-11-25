import type { Directive } from 'vue'

// Uso: <div v-reveal> o <div v-reveal="200"> (retraso en milisegundos).
// El elemento aparece (fundido + subida suave) cuando entra en pantalla.
// Si el navegador no soporta IntersectionObserver, se muestra directamente.
const observer =
  typeof IntersectionObserver === 'undefined'
    ? null
    : new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible')
              observer?.unobserve(entry.target)
            }
          }
        },
        { threshold: 0.15 },
      )

export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    el.classList.add('reveal')
    if (binding.value) el.style.setProperty('--reveal-delay', `${binding.value}ms`)
    if (observer) observer.observe(el)
    else el.classList.add('is-visible')
  },
}
