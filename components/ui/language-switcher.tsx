'use client'

import { useLanguage } from '@/components/providers/language-provider'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'it' ? 'en' : 'it')
  }

  return (
    <button 
      onClick={toggleLanguage}
      className="fixed top-4 right-4 z-50 bg-gray-900/80 backdrop-blur border border-gray-700 rounded-full px-3 py-1.5 text-sm font-bold text-white hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2"
      title={language === 'it' ? "Switch to English" : "Passa all'Italiano"}
    >
      <span>{language === 'it' ? '🇮🇹' : '🇬🇧'}</span>
      <span className="opacity-70 text-xs font-mono uppercase">{language}</span>
    </button>
  )
}