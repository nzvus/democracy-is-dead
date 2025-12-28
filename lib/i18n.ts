import it from '@/locales/it'
import en from '@/locales/en'

export const dictionaries = {
  it,
  en
}

export type Locale = keyof typeof dictionaries 