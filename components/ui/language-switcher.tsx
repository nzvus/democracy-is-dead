'use client'

import { useLanguage } from '@/components/providers/language-provider'

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-1 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10">
      <button 
        onClick={() => setLang('it')}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'it' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
      >
        IT
      </button>
      <button 
        onClick={() => setLang('en')}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'en' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
      >
        EN
      </button>
    </div>
  )
}