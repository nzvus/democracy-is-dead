'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { dictionaries, Language } from '@/lib/i18n'

// Deriviamo il tipo del dizionario basandoci sulla struttura italiana
type Dictionary = typeof dictionaries.it

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Dictionary
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('it')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('did_lang') as Language
    if (saved && (saved === 'it' || saved === 'en')) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('did_lang', lang)
  }

  // Fallback sicuro se dictionaries[language] dovesse mancare
  const t = dictionaries[language] || dictionaries.it

  if (!mounted) {
    return <>{children}</> 
  }

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