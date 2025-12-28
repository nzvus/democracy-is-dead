'use client'

import { useLanguage } from '@/components/providers/language-provider'

export default function LanguageSwitcher() {
  
  const { language, setLanguage } = useLanguage()

  return (
    <div className="fixed top-4 right-4 z-[9999] flex items-center gap-2 bg-gray-900/80 backdrop-blur border border-gray-700 rounded-full p-1 shadow-lg">
      <button
        onClick={() => setLanguage('it')}
        className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
          language === 'it' 
            ? 'bg-white text-black shadow' 
            : 'text-gray-400 hover:text-white'
        }`}
      >
        IT
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
          language === 'en' 
            ? 'bg-white text-black shadow' 
            : 'text-gray-400 hover:text-white'
        }`}
      > 
        EN
      </button>
    </div>
  )
}