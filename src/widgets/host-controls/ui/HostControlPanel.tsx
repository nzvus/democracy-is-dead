import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LobbySettings } from '@/entities/lobby/model/types';
import { Button } from '@/shared/ui/button';
import { Settings, StopCircle } from 'lucide-react';
import { HostSettingsModal } from '@/widgets/lobby-settings/ui/HostSettingsModal';
import { createClient } from '@/shared/api/supabase';

interface HostControlPanelProps {
  lobbyId: string;
  settings: LobbySettings;
  status: string;
}

export const HostControlPanel = ({ lobbyId, settings, status }: HostControlPanelProps) => {
  const t = useTranslations('Host');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();

  const handleEnd = async () => {
    await supabase.from('lobbies').update({ status: 'ended' }).eq('id', lobbyId);
  };

  return (
    <>
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 p-3 glass-card rounded-full scale-90 md:scale-100 origin-bottom border-indigo-500/20">
        <Button 
            variant="secondary" 
            onClick={() => setIsModalOpen(true)}
            className="rounded-full px-5 h-10 text-xs font-bold border bg-gray-800 border-gray-700 text-gray-300"
        >
            <Settings size={16} className="mr-2" />
            {t('title')}
        </Button>

        {status === 'voting' && (
            <>
                <div className="w-px h-6 bg-white/10 mx-1"></div>
                <Button 
                    variant="danger" 
                    onClick={handleEnd}
                    className="rounded-full px-6 h-10 text-xs font-bold uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_-5px_rgba(220,38,38,0.5)] border border-red-400/20"
                >
                    <StopCircle size={14} className="mr-2" />
                    {t('end_vote')}
                </Button>
            </>
        )}
      </div>

      <HostSettingsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        lobbyId={lobbyId} 
        settings={settings}
      />
    </>
  );
};