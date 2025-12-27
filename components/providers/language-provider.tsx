'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

// Importiamo i dizionari IT
import itCommon from '@/locales/it/common'
import itHome from '@/locales/it/home'
import itSetup from '@/locales/it/setup'
import itLobby from '@/locales/it/lobby'
import itResults from '@/locales/it/results'
import itOnboarding from '@/locales/it/onboarding'
import itEncyclopedia from '@/locales/it/encyclopedia' // <--- NUOVO IMPORT

// Importiamo i dizionari EN
import enCommon from '@/locales/en/common'
import enHome from '@/locales/en/home'
import enSetup from '@/locales/en/setup'
import enLobby from '@/locales/en/lobby'
import enResults from '@/locales/en/results'
import enOnboarding from '@/locales/en/onboarding'
import enEncyclopedia from '@/locales/en/encyclopedia' // <--- NUOVO IMPORT

type Language = 'it' | 'en'

const dictionaries = {
  it: {
    common: itCommon,
    home: itHome,
    setup: itSetup,
    lobby: itLobby,
    results: itResults,
    onboarding: itOnboarding,
    encyclopedia: itEncyclopedia, // <--- REGISTRAZIONE NECESSARIA
  },
  en: {
    common: enCommon,
    home: enHome,
    setup: enSetup,
    lobby: enLobby,
    results: enResults,
    onboarding: enOnboarding,
    encyclopedia: enEncyclopedia, // <--- REGISTRAZIONE NECESSARIA
  }
}

interface LanguageContextType {
  t: typeof dictionaries['it']
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('it')
  const setLanguage = (lang: Language) => { setLanguageState(lang) }
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