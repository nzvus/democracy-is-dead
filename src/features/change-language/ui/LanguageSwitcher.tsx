'use client'
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';

export const LanguageSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: 'en' | 'it') => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="fixed top-4 right-4 z-[200] flex items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-2xl">
      <button 
        onClick={() => switchLocale('en')}
        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${locale === 'en' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
      >
        EN
      </button>
      <button 
        onClick={() => switchLocale('it')}
        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${locale === 'it' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
      >
        IT
      </button>
    </div>
  );
};