'use client'
import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useLobbyState } from '@/processes/lobby-flow/model';
import { useSessionAuth } from '@/features/session-auth/model/useSessionAuth';
import { ConfigForm } from '@/features/configure-lobby/ui/ConfigForm';
import { ProfileSetup } from '@/features/session-auth/ui/ProfileSetup';
import { VotingInterface } from '@/widgets/voting-interface/ui/VotingInterface';
import { ResultsDashboard } from '@/widgets/results-dashboard/ui/ResultsDashboard';
import { HostControlPanel } from '@/widgets/host-controls/ui/HostControlPanel';
import { ChatWidget } from '@/widgets/chat-room/ui/ChatWidget';
import { LobbyFlowLayout } from '@/processes/lobby-flow/ui';
import { ShareButton } from '@/features/share-lobby/ui/ShareButton';
import { createClient } from '@/shared/api/supabase';
import { ParticipantAvatar } from '@/entities/participant/ui/ParticipantAvatar';
import { Button } from '@/shared/ui/button';

export const LobbyPage = ({ lobbyId }: { lobbyId: string }) => {
  const t = useTranslations('Lobby');
  const tCommon = useTranslations('Common');
  
  const { lobby, candidates, participants, votes, loading, updateLocalStatus, refreshCandidates } = useLobbyState(lobbyId);
  const { user } = useSessionAuth();
  const [profileSet, setProfileSet] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (user?.user_metadata?.nickname) {
      setProfileSet(true);
    }
  }, [user]);

  const isHost = user && lobby && user.id === lobby.host_id;

  const handleStartSetup = useCallback(async () => {
    if (!isHost) return;
    updateLocalStatus('setup');
    await supabase.from('lobbies').update({ status: 'setup' }).eq('id', lobbyId);
  }, [isHost, lobbyId, supabase, updateLocalStatus]);

  // Auto-Redirect Host to Setup
  useEffect(() => {
    if (isHost && lobby?.status === 'waiting' && profileSet) {
      const timer = setTimeout(() => handleStartSetup(), 500);
      return () => clearTimeout(timer);
    }
  }, [isHost, lobby?.status, profileSet, handleStartSetup]);

  // --- Handlers for Optimistic Updates ---

  const handleLaunchSuccess = async () => {
    updateLocalStatus('voting');
    await refreshCandidates(); // Critical: Ensure we have candidates before rendering VotingInterface
  };

  const handleSuspend = () => {
    updateLocalStatus('setup');
  };

  const handleEnd = () => {
    updateLocalStatus('ended');
  };

  const handleResume = async () => {
    updateLocalStatus('voting');
    await supabase.from('lobbies').update({ status: 'voting' }).eq('id', lobbyId);
  };

  // --- Render ---

  if (loading || !lobby || !user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#030712] text-indigo-500 gap-4">
        <div className="animate-spin text-4xl">{t('loading_icon')}</div>
        <p className="animate-pulse tracking-widest text-xs font-bold uppercase">{tCommon('loading_lobby')}</p>
      </div>
    );
  }

  if (!profileSet) {
    return <ProfileSetup userId={user.id} onComplete={() => setProfileSet(true)} />;
  }

  return (
    <LobbyFlowLayout status={lobby.status}>
      <main className="min-h-screen p-4 md:p-8 pb-32">
        <header className="flex justify-between items-center mb-8 max-w-6xl mx-auto">
          <div>
             <h1 className="text-2xl font-black tracking-tighter text-white">
               {lobby.name && lobby.name !== 'Untitled Lobby' ? lobby.name : t('title', { code: lobby.code })}
             </h1>
             <div className="flex items-center gap-2 mt-1">
               <span className={`w-2 h-2 rounded-full ${lobby.status === 'voting' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
               <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                 {t(lobby.status === 'waiting' ? 'status_waiting' : lobby.status === 'setup' ? 'status_setup' : lobby.status === 'voting' ? 'status_voting' : 'status_ended')}
               </span>
             </div>
          </div>
          <ShareButton code={lobby.code} />
        </header>

        <div className="max-w-6xl mx-auto">
          {/* WAITING */}
          {lobby.status === 'waiting' && (
            <div className="glass-card p-12 text-center max-w-xl mx-auto mt-20 animate-in zoom-in-95 border-indigo-500/20">
               <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-gray-700">
                 <span className="animate-pulse text-4xl">⏳</span>
               </div>
               <h2 className="text-3xl font-bold mb-3 text-white">{t('waiting_title')}</h2>
               <p className="text-gray-400 leading-relaxed mb-8">{t('waiting_desc')}</p>
               
               <div className="flex flex-wrap justify-center gap-3 mb-8">
                 {participants.map(p => (
                   <div key={p.user_id} className="animate-in fade-in slide-in-from-bottom-2 flex flex-col items-center gap-1">
                     <ParticipantAvatar participant={p} className="w-12 h-12 ring-2 ring-gray-900 shadow-lg" />
                     <span className="text-[10px] text-gray-500">{p.nickname}</span>
                   </div>
                 ))}
               </div>

               {isHost && (
                 <Button onClick={handleStartSetup} className="btn-primary w-full max-w-xs mx-auto animate-pulse">
                   {t('configure_btn')}
                 </Button>
               )}
            </div>
          )}

          {/* SETUP */}
          {lobby.status === 'setup' && (
            isHost ? (
               <ConfigForm lobbyId={lobbyId} onSuccess={handleLaunchSuccess} />
            ) : (
               <div className="glass-card p-12 text-center max-w-xl mx-auto mt-20 animate-in zoom-in-95">
                  <div className="w-20 h-20 bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-indigo-500/30">
                    <span className="animate-spin text-4xl">{t('setup_icon')}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">{t('host_configuring')}</h2>
                  <p className="text-gray-400 mt-2">{t('host_configuring_desc')}</p>
               </div>
            )
          )}

          {/* VOTING */}
          {lobby.status === 'voting' && (
            <VotingInterface 
              lobbyId={lobbyId} 
              userId={user.id} 
              candidates={candidates}
              factors={lobby.settings.factors}
              // [FIX] Added safe access with default fallback
              maxScale={lobby.settings?.voting_scale?.max || 10}
            />
          )}

          {/* ENDED */}
          {lobby.status === 'ended' && (
            <ResultsDashboard 
              candidates={candidates} 
              votes={votes}
              factors={lobby.settings.factors}
              onResume={isHost ? handleResume : undefined}
            />
          )}
        </div>

        {isHost && (
            <HostControlPanel 
                lobbyId={lobbyId} 
                settings={lobby.settings} 
                status={lobby.status} 
                onSuspend={handleSuspend} 
                onEnd={handleEnd}
            />
        )}
        <ChatWidget lobbyId={lobbyId} userId={user.id} />
      </main>
    </LobbyFlowLayout>
  );
};