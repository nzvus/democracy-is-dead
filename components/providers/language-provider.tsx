'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { dictionaries, Language, Dictionary } from '@/lib/i18n'

// Definiamo il tipo del Context
type LanguageContextType = {
  t: Dictionary            // Il dizionario corrente (es. l'oggetto italiano)
  lang: Language           // La lingua corrente stringa ('it' | 'en')
  setLang: (lang: Language) => void // Funzione per cambiare lingua
}

// Creiamo il contesto
const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Stato predefinito: Italiano
  const [lang, setLangState] = useState<Language>('it')

  // Funzione per cambiare lingua
  const setLang = (newLang: Language) => {
    setLangState(newLang)
    // Opzionale: Salva nel localStorage per ricordare la scelta
    if (typeof window !== 'undefined') {
        localStorage.setItem('app-lang', newLang)
    }
  }

  // Al montaggio, controlla se c'era una lingua salvata
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('app-lang') as Language
        if (saved && dictionaries[saved]) {
            setLangState(saved)
        }
    }
  }, [])

  // Recupera il dizionario giusto in base alla lingua scelta
  const t = dictionaries[lang]

  return (
    <LanguageContext.Provider value={{ t, lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

// Hook personalizzato per usare la lingua nei componenti
export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}