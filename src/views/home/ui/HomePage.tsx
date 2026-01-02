'use client'
import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { createClient } from '@/shared/api/supabase';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { AuthForm } from '@/features/auth/ui/AuthForm';
import { ArrowRight, LogOut, Clock, Trash2 } from 'lucide-react';
import { useSessionAuth } from '@/features/session-auth/model/useSessionAuth';
import { getHistory, clearHistory, addToHistory } from '@/shared/lib/history-manager';

export const HomePage = () => {
  const t = useTranslations('Home');
  const tAuth = useTranslations('Auth');
  const router = useRouter();
  const supabase = createClient();
  const { user } = useSessionAuth();
  
  const [joinCode, setJoinCode] = useState('');
  const [myLobbies, setMyLobbies] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user && !user.is_anonymous) {
      supabase.from('lobby_participants')
        .select('lobby_id, lobbies(code, name, host_id, status)')
        .eq('user_id', user.id)
        .order('last_seen_at', { ascending: false })
        .limit(5)
        .then(({ data }) => {
          if (data) setMyLobbies(data.map((row: any) => row.lobbies));
        });
    } else {
      setHistory(getHistory());
    }
  }, [user, supabase]);

  const handleCreate = async () => {
    if (!user) return; 
    
    setIsCreating(true);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { data } = await supabase.from('lobbies').insert({
        code,
        host_id: user.id,
        name: "Untitled Lobby",
        settings: { factors: [] }
    }).select('code').single();
    
    if (data) {
        if (!user.is_anonymous) {
            setMyLobbies(prev => [{ code: data.code, name: "Untitled Lobby", host_id: user.id }, ...prev]);
        }
        router.push(`/lobby/${data.code}`);
    }
    setIsCreating(false);
  };

  const handleJoin = () => {
    if (joinCode.length < 4) return;
    router.push(`/lobby/${joinCode.toUpperCase()}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // --- GUEST VIEW ---
  if (!user || user.is_anonymous) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#030712] text-white">
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-600">
              {t('title')}
            </h1>
            <p className="text-gray-400">{t('subtitle')}</p>
          </div>
          <AuthForm onSuccess={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  // --- LOGGED IN VIEW ---
  return (
    <div className="min-h-screen p-6 bg-[#030712] text-white flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full max-w-md flex justify-between items-center mb-10">
        <h2 className="text-lg font-bold text-indigo-400">
          {t('welcome_user', { name: user.user_metadata?.nickname || 'User' })}
        </h2>
        <Button variant="ghost" onClick={handleLogout} className="text-xs h-8 px-3">
          <LogOut size={14} className="mr-2" /> {tAuth('logout')}
        </Button>
      </header>

      {/* Main Content */}
      <div className="w-full max-w-md space-y-10">
        
        {/* Actions Card */}
        <div className="glass-card p-8 space-y-8 border-indigo-500/20 shadow-indigo-900/10">
          <Button onClick={handleCreate} isLoading={isCreating} className="w-full py-6 text-xl btn-primary shadow-lg shadow-indigo-500/20">
            {t('create_lobby')}
          </Button>
          
          <div className="relative flex items-center gap-4">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">{t('or_join')}</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          <div className="flex gap-2">
            <Input 
              value={joinCode} 
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder={t('join_placeholder')}
              className="glass-input text-center font-mono tracking-[0.2em] text-xl font-bold uppercase"
              maxLength={6}
            />
            <Button onClick={handleJoin} className="bg-white text-black hover:bg-gray-200 px-6 rounded-xl">
              <ArrowRight />
            </Button>
          </div>
        </div>

        {/* My Lobbies */}
        <div className="space-y-4 animate-in slide-in-from-bottom-8 duration-700">
          <div className="flex justify-between items-end px-2">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
               <Clock size={14} /> {t('my_lobbies')}
             </h3>
             {myLobbies.length > 0 && !user.is_anonymous && (
               // [FIX] Used translation key
               <span className="text-[10px] text-gray-600 bg-gray-900 px-2 py-1 rounded">{t('syncing')}</span>
             )}
          </div>
          
          <div className="grid gap-3">
            {myLobbies.length === 0 && (
              <div className="text-center py-8 text-gray-600 italic text-sm border border-dashed border-gray-800 rounded-xl">
                {t('no_active_lobbies')}
              </div>
            )}
            
            {myLobbies.map((l) => (
              <button 
                key={l.code}
                onClick={() => router.push(`/lobby/${l.code}`)}
                className="glass-card p-4 flex justify-between items-center text-left hover:border-indigo-500/40 hover:bg-white/5 transition-all group"
              >
                <div>
                  <div className="font-bold text-base text-gray-200 group-hover:text-white transition-colors">{l.name || "Untitled Lobby"}</div>
                  <div className="text-[10px] text-gray-500 font-mono mt-1">
                    {t('lobby_code_display', { code: l.code })}
                  </div>
                </div>
                {l.host_id === user.id && (
                  <span className="text-[10px] font-black bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30">
                    {tAuth('host_session') || 'HOST'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};