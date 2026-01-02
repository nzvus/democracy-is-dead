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
import { getHistory } from '@/shared/lib/history-manager';

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
        // Query participants -> join lobbies
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
      // Load Local History for Guests
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

  // --- LOGGED IN DASHBOARD (Single Column) ---
  return (
    <div className="min-h-screen bg-[#030712] text-white flex justify-center p-4 md:p-8">
      <div className="w-full max-w-xl space-y-12">
        
        {/* Header */}
        <header className="flex justify-between items-center pb-6 border-b border-white/10">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                {t('welcome_user', { name: user.user_metadata?.nickname || 'User' })}
            </h2>
            <Button variant="ghost" onClick={handleLogout} className="text-xs h-8 px-3 text-red-400 hover:text-red-300 hover:bg-red-900/10">
                <LogOut size={14} className="mr-2" /> {tAuth('logout')}
            </Button>
        </header>

        {/* Profile Editor (Collapsible or Inline) */}
        <ProfileEditor user={user} />

        {/* Actions */}
        <div className="glass-card p-8 space-y-6 border-indigo-500/20 shadow-[0_0_40px_rgba(79,70,229,0.1)]">
            <Button onClick={handleCreate} isLoading={isCreating} className="w-full py-5 text-lg btn-primary">
                <Plus className="mr-2" /> {t('create_lobby')}
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
                    className="glass-input text-center font-mono font-bold uppercase tracking-widest text-xl h-14"
                    maxLength={6}
                />
                <Button onClick={handleJoin} className="bg-white text-black hover:bg-gray-200 h-14 px-6 rounded-xl">
                    <ArrowRight />
                </Button>
            </div>
        </div>

        {/* History List */}
        <div className="space-y-4 animate-in slide-in-from-bottom-8 duration-700">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 px-2">
               <Clock size={14} /> {tDash('my_lobbies')}
            </h3>

            <div className="grid gap-3">
                {myLobbies.length === 0 && (
                    <div className="text-center py-12 text-gray-600 italic text-sm border border-dashed border-gray-800 rounded-2xl bg-black/20">
                        {tDash('no_lobbies')}
                    </div>
                )}

                {myLobbies.map((l: any) => (
                    <div 
                        key={l.code || Math.random()} 
                        className="glass-card p-4 flex justify-between items-center hover:border-indigo-500/40 hover:bg-white/5 transition-all group relative overflow-hidden"
                    >
                        <div className="z-10">
                            <div className="font-bold text-lg text-gray-200 group-hover:text-white transition-colors">{l.name || "Untitled Lobby"}</div>
                            <div className="text-xs text-gray-500 font-mono mt-1">
                                {t('lobby_code_display', { code: l.code })}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 z-10">
                            {l.host_id === user.id && (
                                <span className="text-[10px] font-black bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30">
                                    {tDash('host_badge')}
                                </span>
                            )}
                            <Button 
                                onClick={() => router.push(`/lobby/${l.code}`)} 
                                className="h-9 w-9 p-0 rounded-full bg-white text-black hover:bg-gray-200 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all"
                            >
                                <Play size={14} fill="currentColor" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};