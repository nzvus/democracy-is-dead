'use client'
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/shared/api/supabase';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { LobbySettings } from '@/entities/lobby/model/types';
import { PauseCircle, Eye, EyeOff, Download, Database } from 'lucide-react';
import { toast } from 'sonner';

interface HostSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lobbyId: string;
  settings: LobbySettings;
  onSuspend?: () => void;
}

export const HostSettingsModal = ({ isOpen, onClose, lobbyId, settings, onSuspend }: HostSettingsModalProps) => {
  const t = useTranslations('Host');
  const [tab, setTab] = useState<'privacy' | 'manage'>('privacy');
  const [isExporting, setIsExporting] = useState(false);
  const supabase = createClient();

  const currentPrivacy = (typeof settings.privacy === 'object' && settings.privacy !== null)
    ? settings.privacy as Record<string, string>
    : { users: 'visible', candidates: 'visible', factors: 'visible' };

  const updatePrivacy = async (key: string, val: string) => {
    const newPrivacy = { ...currentPrivacy, [key]: val };
    const { error } = await supabase
      .from('lobbies')
      .update({ settings: { ...settings, privacy: newPrivacy } })
      .eq('id', lobbyId);
      
    if (!error) toast.success(t('privacy_updated'));
  };

  const handleSuspend = async () => {
    if (onSuspend) onSuspend();
    const { error } = await supabase.from('lobbies').update({ status: 'setup' }).eq('id', lobbyId);
    if (error) toast.error(t('end_error'));
    else {
        toast.success("Lobby Suspended");
        onClose(); 
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
        const [lobby, candidates, factors, participants, votes, messages] = await Promise.all([
            supabase.from('lobbies').select('*').eq('id', lobbyId).single(),
            supabase.from('candidates').select('*').eq('lobby_id', lobbyId),
            supabase.from('factors').select('*').eq('lobby_id', lobbyId),
            supabase.from('lobby_participants').select('*').eq('lobby_id', lobbyId),
            supabase.from('votes').select('*').eq('lobby_id', lobbyId),
            supabase.from('lobby_messages').select('*').eq('lobby_id', lobbyId),
        ]);

        const exportData = {
            timestamp: new Date().toISOString(),
            lobby: lobby.data,
            configuration: {
                candidates: candidates.data,
                factors: factors.data
            },
            session: {
                participants: participants.data,
                messages: messages.data,
                votes: votes.data
            },
            stats: {
                vote_count: votes.data?.length || 0,
                participant_count: participants.data?.length || 0
            }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `did-lobby-${lobby.data?.code || lobbyId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("Export Complete");
    } catch (e) {
        console.error(e);
        toast.error("Export Failed");
    } finally {
        setIsExporting(false);
    }
  };

  const sections = ['users', 'candidates', 'factors'] as const;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('title')}>
      <div className="flex gap-2 mb-6 border-b border-gray-700 pb-2">
        <button onClick={() => setTab('privacy')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${tab === 'privacy' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            {t('tab_privacy')}
        </button>
        <button onClick={() => setTab('manage')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${tab === 'manage' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            {t('tab_manage')}
        </button>
      </div>

      {tab === 'privacy' && (
        <div className="space-y-4">
            {sections.map((section) => (
                <div key={section} className="flex items-center justify-between bg-gray-800 p-3 rounded-xl border border-gray-700">
                    <span className="font-bold text-sm text-gray-300 capitalize">{t(`privacy_sections.${section}` as any)}</span>
                    <div className="flex bg-black/40 rounded-lg p-1">
                        <button onClick={() => updatePrivacy(section, 'visible')} className={`p-1.5 rounded-md transition-all ${currentPrivacy[section] !== 'hidden' ? 'bg-green-500/20 text-green-400' : 'text-gray-600 hover:text-gray-400'}`}><Eye size={16} /></button>
                        <button onClick={() => updatePrivacy(section, 'hidden')} className={`p-1.5 rounded-md transition-all ${currentPrivacy[section] === 'hidden' ? 'bg-red-500/20 text-red-400' : 'text-gray-600 hover:text-gray-400'}`}><EyeOff size={16} /></button>
                    </div>
                </div>
            ))}
        </div>
      )}

      {tab === 'manage' && (
        <div className="space-y-6">
            {/* Suspend Section */}
            <div className="bg-yellow-900/20 border border-yellow-500/20 p-4 rounded-xl text-center">
                <p className="text-xs text-yellow-200/80 mb-4 leading-relaxed">{t('suspend_desc')}</p>
                <Button variant="danger" onClick={handleSuspend} className="w-full justify-center">
                    <PauseCircle size={18} className="mr-2" /> {t('suspend_vote')}
                </Button>
            </div>

            {/* Export Section */}
            <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-xl text-center">
                <div className="flex items-center justify-center gap-2 text-indigo-300 font-bold mb-2">
                    <Database size={16} /> {t('data_export')}
                </div>
                <p className="text-xs text-gray-400 mb-4">{t('export_desc')}</p>
                <Button variant="secondary" onClick={handleExport} isLoading={isExporting} className="w-full justify-center">
                    <Download size={18} className="mr-2" /> {t('download_btn')}
                </Button>
            </div>
        </div>
      )}
    </Modal>
  );
};