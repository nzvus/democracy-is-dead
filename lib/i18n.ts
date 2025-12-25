import { it } from '@/locales/it'
import { en } from '@/locales/en' // <--- IMPORTANTE: Importa dalla cartella EN

export const dictionaries = {
  it: it,
  en: en // <--- IMPORTANTE: Usa l'oggetto EN, non IT
}

export type Dictionary = typeof dictionaries.it
export type Language = keyof typeof dictionaries