'use client'

import { useLanguage } from '@/components/providers/language-provider';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="absolute top-4 right-4 z-50 flex gap-2 bg-black/20 backdrop-blur-md p-1 rounded-full border border-white/10">
      <button
        onClick={() => setLanguage('it')}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          language === 'it' ? 'bg-white/20 scale-110 shadow-lg' : 'opacity-50 hover:opacity-100'
        }`}
        title="Italiano"
      >
        🇮🇹
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          language === 'en' ? 'bg-white/20 scale-110 shadow-lg' : 'opacity-50 hover:opacity-100'
        }`}
        title="English"
      >
        🇬🇧
      </button>
    </div>
  );
}