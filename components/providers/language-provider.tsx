'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { dictionaries, Language } from '@/lib/i18n'

type Dictionary = typeof dictionaries.it

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Dictionary
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('it')

  // Carica preferenza salvata solo lato client
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

  // Fallback sicuro
  const t = dictionaries[language] || dictionaries.it

  // NOTA: Abbiamo rimosso il check "if (!mounted) return <>{children}</>"
  // Il Provider deve avvolgere i figli SEMPRE, anche durante il server rendering.
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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