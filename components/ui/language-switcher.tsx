'use client'

import { useLanguage } from '@/components/providers/language-provider';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="absolute top-6 right-6 z-50 flex gap-3 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10 shadow-xl">
      
      <button
        onClick={() => setLanguage('it')}
        className={`relative w-8 h-8 rounded-full overflow-hidden transition-all duration-300 border-2 ${
          language === 'it' 
            ? 'border-indigo-500 scale-110 shadow-[0_0_15px_rgba(99,102,241,0.5)] grayscale-0' 
            : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105 grayscale'
        }`}
        title="Italiano"
      >
        <img 
            src="https://flagcdn.com/w80/it.png" 
            alt="Italiano" 
            className="w-full h-full object-cover"
        />
      </button>

      <button
        onClick={() => setLanguage('en')}
        className={`relative w-8 h-8 rounded-full overflow-hidden transition-all duration-300 border-2 ${
          language === 'en' 
            ? 'border-indigo-500 scale-110 shadow-[0_0_15px_rgba(99,102,241,0.5)] grayscale-0' 
            : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105 grayscale'
        }`}
        title="English"
      >
        <img 
            src="https://flagcdn.com/w80/gb.png" 
            alt="English" 
            className="w-full h-full object-cover"
        />
      </button>

    </div>
  );
}