'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { dictionary } from '@/lib/i18n'

// Tipi derivati dal dizionario
export type Language = 'it' | 'en'
type Dictionary = typeof dictionary.it

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Dictionary
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default: Italiano
  const [language, setLanguageState] = useState<Language>('it')
  
  // Carica preferenza salvata all'avvio
  useEffect(() => {
    const saved = localStorage.getItem('did_lang') as Language
    if (saved && (saved === 'it' || saved === 'en')) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('did_lang', lang)
  }

  const t = dictionary[language]

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

// Hook personalizzato per usare la lingua nei componenti
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}