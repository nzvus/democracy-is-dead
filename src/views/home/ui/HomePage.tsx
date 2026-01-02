'use client'
import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { createClient } from '@/shared/api/supabase';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { AuthForm } from '@/features/auth/ui/AuthForm';
import { ArrowRight, Clock, Plus, Play } from 'lucide-react';
import { useSessionAuth } from '@/features/session-auth/model/useSessionAuth';
import { ProfileEditor } from '@/widgets/user-dashboard/ui/ProfileEditor';

export const HomePage = () => {
  const t = useTranslations('Home');
  const tDash = useTranslations('Dashboard');
  const router = useRouter();
  const supabase = createClient();
  const { user } = useSessionAuth();
  
  const [joinCode, setJoinCode] = useState('');
  const [myLobbies, setMyLobbies] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch User's Lobbies (Correct Join Query)
  useEffect(() => {
    if (user && !user.is_anonymous) {
      const fetchLobbies = async () => {
        const { data, error } = await supabase
            .from('lobby_participants')
            .select(`
                lobby_id,
                last_seen_at,
                lobbies (
                    id, code, name, host_id, status
                )
            `)
            .eq('user_id', user.id)
            .order('last_seen_at', { ascending: false })
            .limit(10);

        if (!error && data) {
            // Flatten structure
            const lobbies = data
                .map((row: any) => row.lobbies)
                .filter((l: any) => l !== null); // Filter out deleted lobbies
            setMyLobbies(lobbies);
        }
      };
      fetchLobbies();
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

  // --- GUEST VIEW ---
  if (!user || user.is_anonymous) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#030712] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
        <div className="w-full max-w-md space-y-8 relative z-10">
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

  // --- DASHBOARD VIEW ---
  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#030712] text-white">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">
        
        {/* LEFT COL: Profile & Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
            <ProfileEditor user={user} />
            
            <div className="glass-card p-6 space-y-6">
                <Button onClick={handleCreate} isLoading={isCreating} className="w-full py-4 text-lg btn-primary">
                    <Plus className="mr-2" /> {t('create_lobby')}
                </Button>
                <div className="flex gap-2">
                    <Input 
                        value={joinCode} 
                        onChange={e => setJoinCode(e.target.value.toUpperCase())}
                        placeholder={t('join_placeholder')}
                        className="glass-input text-center font-mono font-bold uppercase"
                        maxLength={6}
                    />
                    <Button onClick={handleJoin} className="bg-white text-black hover:bg-gray-200 rounded-xl px-4">
                        <ArrowRight />
                    </Button>
                </div>
            </div>
        </div>

        {/* RIGHT COL: My Lobbies (8 cols) */}
        <div className="lg:col-span-8">
            <div className="glass-card p-8 min-h-[600px] flex flex-col animate-in slide-in-from-right-4 duration-500 delay-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Clock className="text-indigo-400" /> {tDash('my_lobbies')}
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                    {myLobbies.length === 0 && (
                        <div className="col-span-2 text-center py-20 text-gray-600 italic border-2 border-dashed border-gray-800 rounded-2xl">
                            {tDash('no_lobbies')}
                        </div>
                    )}

                    {myLobbies.map((l) => (
                        <div 
                            key={l.id} 
                            className="bg-black/20 hover:bg-indigo-900/10 border border-white/5 hover:border-indigo-500/30 rounded-2xl p-5 transition-all group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-200 transition-colors truncate max-w-[200px]">
                                        {l.name || "Untitled Lobby"}
                                    </h3>
                                    <span className="text-xs font-mono text-gray-500 bg-black/40 px-2 py-1 rounded">
                                        {l.code}
                                    </span>
                                </div>
                                <span className={`text-[10px] font-black px-2 py-1 rounded border ${l.host_id === user.id ? 'border-yellow-500/30 text-yellow-500' : 'border-blue-500/30 text-blue-500'}`}>
                                    {l.host_id === user.id ? tDash('host_badge') : tDash('guest_badge')}
                                </span>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <span className={`text-xs uppercase font-bold ${l.status === 'voting' ? 'text-green-400 animate-pulse' : 'text-gray-600'}`}>
                                    {l.status}
                                </span>
                                <Button 
                                    onClick={() => router.push(`/lobby/${l.code}`)} 
                                    className="h-8 text-xs bg-white text-black hover:bg-gray-200 shadow-none"
                                >
                                    {l.status === 'ended' ? tDash('view_results') : tDash('resume')} <Play size={10} className="ml-1" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};