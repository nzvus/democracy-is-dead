'use client'
import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { createClient } from '@/shared/api/supabase';
import { Settings, LogOut, Globe, Home as HomeIcon, X, User as UserIcon } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useParams } from 'next/navigation';

export const SettingsMenu = () => {
  const t = useTranslations('Settings');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const supabase = createClient();
  
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/'; // Hard reload to clear state
  };

  const switchLocale = (newLocale: 'en' | 'it') => {
    router.replace(pathname, { locale: newLocale });
  };

  const leaveLobby = () => {
    router.push('/');
    setIsOpen(false);
  };

  const lobbyCode = params?.code as string;

  return (
    <div className="fixed top-6 right-6 z-[100]" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-full transition-all duration-300 shadow-xl border border-white/10 ${isOpen ? 'bg-indigo-600 text-white rotate-90' : 'bg-[#0b0f19]/80 text-gray-300 hover:bg-indigo-600 hover:text-white backdrop-blur-md'}`}
      >
        <Settings size={24} />
      </button>

      {isOpen && (
        <div className="absolute top-14 right-0 w-64 glass-card p-4 animate-in slide-in-from-top-4 fade-in duration-200 flex flex-col gap-4 border border-indigo-500/30">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{t('title')}</span>
            {lobbyCode && (
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                {t('current_lobby', { code: lobbyCode })}
              </span>
            )}
          </div>

          {/* Language Switcher */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 flex items-center gap-2">
                <Globe size={12} /> {t('language')}
            </label>
            <div className="flex bg-black/40 p-1 rounded-lg">
                {['en', 'it'].map((l) => (
                    <button
                        key={l}
                        onClick={() => switchLocale(l as 'en' | 'it')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${locale === l ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {l.toUpperCase()}
                    </button>
                ))}
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="space-y-2">
            {lobbyCode && (
                <Button variant="secondary" onClick={leaveLobby} className="w-full justify-start text-xs h-9">
                    <HomeIcon size={14} className="mr-2" /> {t('leave_lobby')}
                </Button>
            )}
            
            <Button variant="danger" onClick={handleLogout} className="w-full justify-start text-xs h-9 bg-red-900/20 hover:bg-red-600 border-red-900/30 text-red-200 hover:text-white">
                <LogOut size={14} className="mr-2" /> {t('logout')}
            </Button>
          </div>

        </div>
      )}
    </div>
  );
};