import { it } from '@/locales/it'
// import { en } from '@/locales/en' // Futuro

export const dictionaries = {
  it: it,
  en: it // Fallback su IT
}

export type Dictionary = typeof dictionaries.it
export type Language = keyof typeof dictionaries