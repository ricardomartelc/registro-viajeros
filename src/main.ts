import '@fontsource-variable/fraunces'
import './assets/tokens.css'
import './assets/base.css'
import { createApp } from 'vue'
import App from './App.vue'
import { vReveal } from './ui/shared/vReveal'

createApp(App).directive('reveal', vReveal).mount('#app')
