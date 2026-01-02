'use client'
import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { createClient } from '@/shared/api/supabase';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { toast } from 'sonner';
import { getHistory, clearHistory, addToHistory } from '@/shared/lib/history-manager';
import { Trash2, Clock, ArrowRight } from 'lucide-react';

export const HomePage = () => {
  const t = useTranslations('Home');
  const tCommon = useTranslations('Common');
  
  const router = useRouter();
  const supabase = createClient();
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleCreate = async () => {
    setIsCreating(true);
    const { data: { user } } = await supabase.auth.signInAnonymously();
    if (!user) {
        toast.error(tCommon('auth_failed'));
        setIsCreating(false);
        return;
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data, error } = await supabase
        .from('lobbies')
        .insert({
            code,
            host_id: user.id,
            status: 'waiting',
            settings: { factors: [] }
        })
        .select('code')
        .single();

    if (error) {
        toast.error(tCommon('error'));
        setIsCreating(false);
    } else {
        addToHistory({ code: data.code, name: "New Lobby", role: 'host' });
        router.push(`/lobby/${data.code}`);
    }
  };

  const handleJoin = () => {
    if (joinCode.length < 4) return toast.error("Invalid Code");
    addToHistory({ code: joinCode.toUpperCase(), name: "Joined Lobby", role: 'guest' });
    router.push(`/lobby/${joinCode.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#030712] text-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />
      
      <div className="max-w-md w-full space-y-10 text-center relative z-10">
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-600 tracking-tighter">
            {t('title')}
          </h1>
          <p className="text-lg text-gray-400 max-w-sm mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        <div className="glass-card p-8 space-y-8 animate-in zoom-in-95 duration-500 delay-100">
          <Button onClick={handleCreate} isLoading={isCreating} className="w-full py-6 text-xl btn-primary shadow-indigo-500/20">
            {t('create_lobby')}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-[#0b0f19] px-4 text-gray-500 font-bold">{t('or_join')}</span></div>
          </div>

          <div className="flex gap-3">
            <Input 
              placeholder={t('join_placeholder')} 
              value={joinCode} 
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="glass-input text-center font-mono uppercase tracking-[0.2em] text-xl font-bold"
              maxLength={6}
            />
            <Button onClick={handleJoin} className="px-6 bg-white text-black hover:bg-gray-200 font-bold rounded-xl transition-transform active:scale-95">
                <ArrowRight />
            </Button>
          </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
            <div className="w-full animate-in slide-in-from-bottom-8 duration-700 delay-200">
                <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Clock size={12} /> {t('recent_lobbies')}
                    </h3>
                    <button onClick={() => { clearHistory(); setHistory([]); }} className="text-gray-600 hover:text-red-400 transition-colors text-xs flex items-center gap-1">
                        <Trash2 size={12} /> {t('clear_history')}
                    </button>
                </div>
                
                <div className="grid gap-3">
                    {history.map((h) => (
                    <button 
                        key={h.code}
                        onClick={() => router.push(`/lobby/${h.code}`)}
                        className="glass-card p-4 flex justify-between items-center text-left hover:bg-white/5 transition-all group border border-white/5 hover:border-indigo-500/30"
                    >
                        <div>
                            <div className="font-bold text-gray-200 group-hover:text-white transition-colors">{h.name || "Lobby " + h.code}</div>
                            <div className="text-[10px] text-gray-600 font-mono mt-1 group-hover:text-indigo-400">
                              {`CODE: ${h.code}`} {/* [FIX] Template literal */}
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`text-[10px] px-2 py-1 rounded-full border font-bold ${h.role === 'host' ? 'border-yellow-500/20 text-yellow-500/80 bg-yellow-500/10' : 'border-blue-500/20 text-blue-500/80 bg-blue-500/10'}`}>
                                {h.role === 'host' ? 'HOST' : 'GUEST'}
                            </span>
                        </div>
                    </button>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};