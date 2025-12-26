'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

// Importiamo tutti i dizionari Italiani
import itCommon from '@/locales/it/common'
import itHome from '@/locales/it/home'
import itSetup from '@/locales/it/setup'
import itLobby from '@/locales/it/lobby'
import itResults from '@/locales/it/results'

// Importiamo tutti i dizionari Inglesi
import enCommon from '@/locales/en/common'
import enHome from '@/locales/en/home'
import enSetup from '@/locales/en/setup'
import enLobby from '@/locales/en/lobby'
import enResults from '@/locales/en/results'

// Definiamo i tipi
type Language = 'it' | 'en'

// Struttura completa del dizionario
const dictionaries = {
  it: {
    common: itCommon,
    home: itHome,
    setup: itSetup,
    lobby: itLobby,
    results: itResults,
  },
  en: {
    common: enCommon,
    home: enHome,
    setup: enSetup,
    lobby: enLobby,
    results: enResults,
  }
}

// 1. DEFINIZIONE DEL TIPO DEL CONTESTO (Qui c'era l'errore)
interface LanguageContextType {
  t: typeof dictionaries['it'] // Il dizionario corrente
  language: Language           // La lingua corrente ('it' o 'en')
  setLanguage: (lang: Language) => void // La funzione per cambiare lingua
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Stato della lingua (default italiano)
  const [language, setLanguageState] = useState<Language>('it')

  // Funzione per cambiare lingua
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  // Seleziona il dizionario giusto
  const t = dictionaries[language]

  return (
    <LanguageContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}