import React from 'react';
import { useTranslations } from 'next-intl';
import { useHostActions } from '../model/useHostActions';
import { LobbySettings } from '@/entities/lobby/model/types';
import { Button } from '@/shared/ui/button';
import { Shield, ShieldAlert, StopCircle } from 'lucide-react';

interface HostControlPanelProps {
  lobbyId: string;
  settings: LobbySettings;
  status: string; // [FIX] Added status prop
}

export const HostControlPanel = ({ lobbyId, settings, status }: HostControlPanelProps) => {
  const t = useTranslations('Host');
  const { togglePrivacy, endVoting } = useHostActions(lobbyId, settings);
  const isAnon = settings.privacy === 'anonymous';

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 p-3 glass-card rounded-full scale-90 md:scale-100 origin-bottom border-indigo-500/20">
      <div className="pl-3 pr-1 text-[10px] font-black text-indigo-400 uppercase tracking-widest hidden md:block">
        {t('title')}
      </div>
      
      <div className="w-px h-6 bg-white/10 hidden md:block"></div>

      <Button 
        variant="secondary" 
        onClick={togglePrivacy}
        className={`rounded-full px-5 h-10 text-xs font-bold border transition-all duration-300 ${isAnon ? 'bg-green-900/20 border-green-500/50 text-green-400 shadow-[0_0_15px_-5px_rgba(74,222,128,0.3)]' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
        title={t('title')}
      >
        {isAnon ? <Shield size={14} className="mr-2" /> : <ShieldAlert size={14} className="mr-2" />}
        <span className="hidden sm:inline">
          {isAnon ? t('anon_active') : t('public')}
        </span>
      </Button>

      {/* Only show End Vote if currently voting */}
      {status === 'voting' && (
        <>
            <div className="w-px h-6 bg-white/10 mx-1"></div>
            <Button 
                variant="danger" 
                onClick={endVoting}
                className="rounded-full px-6 h-10 text-xs font-bold uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_-5px_rgba(220,38,38,0.5)] border border-red-400/20"
            >
                <StopCircle size={14} className="mr-2" />
                {t('end_vote')}
            </Button>
        </>
      )}
    </div>
  );
};