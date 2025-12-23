'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionaries, Language } from '@/lib/i18n';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof dictionaries['it']; // t sta per "translate"
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('it'); // Default Italiano

  // Carica la preferenza salvata all'avvio
  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved) setLanguage(saved);
  }, []);

  // Salva la preferenza quando cambia
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage: handleSetLanguage, 
      t: dictionaries[language] 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook personalizzato per usare la lingua ovunque
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}