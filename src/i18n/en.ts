import type { es } from './es'

// Textos en inglés. Debe tener exactamente las mismas claves que es.ts.
export const en: Record<keyof typeof es, string> = {
  brand: 'Can Vauma',
  'lang.label': 'Language',

  'welcome.photoAlt':
    'The white Can Vauma house, with a lawn and a hedge under a blue sky',
  'welcome.place': 'Alcúdia · Mallorca',
  'welcome.lead':
    'Register everyone staying with us. It takes a few minutes and your details are not stored on any server.',
  'welcome.start': 'Start',
  'welcome.howTitle': 'How it works',
  'welcome.step1.title': 'Fill in the details',
  'welcome.step1.text': 'Yours and those of everyone staying with you.',
  'welcome.step2.title': 'Download the file',
  'welcome.step2.text': 'When you finish, a file is saved on your device.',
  'welcome.step3.title': 'Send it by email',
  'welcome.step3.text': 'We will show you how, step by step.',
  'welcome.privacy': 'The form works in your browser and does not send your details to any server.',
  'welcome.privacyLink': 'Privacy notice',

  'steps.label': 'Registration progress',

  'field.optional': '(optional)',
  'field.errorPrefix': 'Error:',
}
