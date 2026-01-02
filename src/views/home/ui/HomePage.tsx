'use client'
import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { createClient } from '@/shared/api/supabase';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { AuthForm } from '@/features/auth/ui/AuthForm';
import { ArrowRight, LogOut, Clock, Plus, Play } from 'lucide-react';
import { useSessionAuth } from '@/features/session-auth/model/useSessionAuth';
import { ProfileEditor } from '@/widgets/user-dashboard/ui/ProfileEditor';
import { getHistory, clearHistory } from '@/shared/lib/history-manager';

export const HomePage = () => {
  const t = useTranslations('Home');
  const tDash = useTranslations('Dashboard');
  const tAuth = useTranslations('Auth');
  const router = useRouter();
  const supabase = createClient();
  const { user } = useSessionAuth();
  
  const [joinCode, setJoinCode] = useState('');
  const [myLobbies, setMyLobbies] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch User's Lobbies (Corrected Logic)
  useEffect(() => {
    if (user && !user.is_anonymous) {
      const fetchLobbies = async () => {
        const { data, error } = await supabase
            .from('lobby_participants')
            .select(`
                last_seen_at,
                lobbies!inner (
                    id, code, name, host_id, status
                )
            `)
            .eq('user_id', user.id)
            .order('last_seen_at', { ascending: false })
            .limit(10);

        if (!error && data) {
            setMyLobbies(data.map((row: any) => row.lobbies));
        }
      };
      fetchLobbies();
    } else {
      setMyLobbies(getHistory());
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
    
    if (data) router.push(`/lobby/${data.code}`);
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#030712] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
        <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in zoom-in-95">
          <div className="text-center space-y-4">
            <h1 className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-600">
              {t('title')}
            </h1>
            <p className="text-gray-400 text-lg">{t('subtitle')}</p>
          </div>
          <AuthForm onSuccess={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  // --- COMPACT DASHBOARD ---
  return (
    <div className="min-h-screen p-4 bg-[#030712] text-white flex justify-center items-start pt-10 md:pt-20">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
        
        {/* LEFT: Profile & Actions */}
        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    {t('welcome_user', { name: user.user_metadata?.nickname || 'User' })}
                </h2>
                <Button variant="ghost" onClick={handleLogout} className="text-[10px] h-7 px-2 text-red-400 hover:bg-red-900/10">
                    <LogOut size={12} className="mr-1" /> {tAuth('logout')}
                </Button>
            </div>

            <div className="glass-card p-6 space-y-4 border-indigo-500/20">
                <Button onClick={handleCreate} isLoading={isCreating} className="w-full py-4 text-base btn-primary">
                    <Plus className="mr-2" size={18} /> {t('create_lobby')}
                </Button>
                
                <div className="relative flex items-center gap-4 py-2">
                    <div className="h-px bg-white/10 flex-1"></div>
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{t('or_join')}</span>
                    <div className="h-px bg-white/10 flex-1"></div>
                </div>

                <div className="flex gap-2">
                    <Input 
                        value={joinCode} 
                        onChange={e => setJoinCode(e.target.value.toUpperCase())}
                        placeholder={t('join_placeholder')}
                        className="glass-input text-center font-mono font-bold uppercase tracking-widest h-12"
                        maxLength={6}
                    />
                    <Button onClick={handleJoin} className="bg-white text-black hover:bg-gray-200 h-12 px-5 rounded-xl">
                        <ArrowRight size={18} />
                    </Button>
                </div>
            </div>

            {/* Collapsed Profile Editor */}
            <div className="glass-card p-4">
               <ProfileEditor user={user} />
            </div>
        </div>

        {/* RIGHT: History */}
        <div className="glass-card p-6 min-h-[400px] flex flex-col">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-4">
               <Clock size={14} /> {tDash('my_lobbies')}
            </h3>

            <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1 custom-scrollbar">
                {myLobbies.length === 0 && (
                    <div className="text-center py-12 text-gray-600 italic text-sm border border-dashed border-gray-800 rounded-xl bg-black/20">
                        {tDash('no_lobbies')}
                    </div>
                )}

                {myLobbies.map((l: any) => (
                    <div 
                        key={l.id || l.code} 
                        className="bg-black/20 p-3 rounded-xl border border-white/5 hover:border-indigo-500/30 flex justify-between items-center group transition-all"
                    >
                        <div>
                            <div className="font-bold text-sm text-gray-200 group-hover:text-white transition-colors">{l.name || "Untitled Lobby"}</div>
                            <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                                {t('lobby_code_display', { code: l.code })}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {l.host_id === user.id && (
                                <span className="text-[9px] font-black bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20">HOST</span>
                            )}
                            <button 
                                onClick={() => router.push(`/lobby/${l.code}`)} 
                                className="p-2 rounded-lg bg-white text-black hover:bg-indigo-400 hover:text-white transition-all shadow-lg"
                            >
                                <Play size={12} fill="currentColor" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};