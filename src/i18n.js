import { createI18n } from 'vue-i18n'
import ar from './locales/ar.json'

const messages = {
  ar
}

const i18n = createI18n({
  legacy: false,
  locale: 'ar',
  fallbackLocale: 'ar',
  messages,
  globalInjection: true,
  compositionOnly: true
})

export default i18n
