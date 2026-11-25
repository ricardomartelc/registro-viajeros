<script setup lang="ts">
import AppButton from '../shared/AppButton.vue'
import fachada from '../../assets/photos/fachada.jpg'
</script>

<template>
  <main class="welcome">
    <header class="welcome__photo">
      <img :src="fachada" alt="Fachada de la casa Can Vauma" />
      <div class="welcome__bar">
        <span class="welcome__brand">Can Vauma</span>
        <span class="lang" role="group" aria-label="Idioma">
          <button type="button" class="lang__btn lang__btn--on">ES</button>
          <button type="button" class="lang__btn">EN</button>
        </span>
      </div>
    </header>

    <section class="welcome__body">
      <div v-reveal>
        <h1>Can Vauma</h1>
        <p class="welcome__place">Alcúdia, Mallorca · Registro de viajeros</p>
      </div>
      <p v-reveal="120">
        La normativa española exige comunicar los datos de todas las personas alojadas. Rellenar
        este formulario le llevará unos [X] minutos.
      </p>
      <p v-reveal="200" class="welcome__privacy">
        Sus datos no se guardan en ningún servidor.
        <a href="#aviso">Aviso de privacidad</a>
      </p>
      <div v-reveal="280">
        <AppButton href="#estancia">Comenzar</AppButton>
      </div>
    </section>
  </main>
</template>

<style scoped>
.welcome {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100dvh;
  background: var(--color-paper);
}
.welcome__photo {
  position: relative;
}
.welcome__photo img {
  display: block;
  width: 100%;
  height: 340px;
  object-fit: cover;
}
.welcome__bar {
  position: absolute;
  inset: 0 0 auto 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: linear-gradient(rgb(20 14 10 / 0.45), transparent);
  color: #fff;
}
.welcome__brand {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  letter-spacing: 0.02em;
}
.lang {
  display: flex;
  padding: 3px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
}
.lang__btn {
  min-width: var(--tap-min);
  min-height: 36px;
  border: 0;
  border-radius: var(--radius-pill);
  background: transparent;
  color: #fff;
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
}
.lang__btn--on {
  background: #fff;
  color: var(--color-ink);
}
.welcome__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-4) var(--space-6);
}
h1 {
  font-size: var(--text-hero);
}
.welcome__place {
  margin: var(--space-2) 0 0;
  color: var(--color-muted);
  letter-spacing: 0.03em;
}
.welcome__body p {
  margin: 0;
}
.welcome__privacy {
  font-size: var(--text-sm);
  color: var(--color-muted);
}
</style>
