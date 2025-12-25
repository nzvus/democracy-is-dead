import { it } from '@/locales/it'
import { en } from '@/locales/en' 

export const dictionaries = {
  it: it,
  en: en
}

export type Dictionary = typeof dictionaries.it
export type Language = keyof typeof dictionaries