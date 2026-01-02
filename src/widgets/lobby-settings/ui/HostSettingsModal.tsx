'use client'
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/shared/api/supabase';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { LobbySettings } from '@/entities/lobby/model/types';
import { PauseCircle, Eye, EyeOff } from 'lucide-react';
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
  const supabase = createClient();

  // Normalize privacy settings safely
  const currentPrivacy = (typeof settings.privacy === 'object' && settings.privacy !== null)
    ? settings.privacy as Record<string, string>
    : { users: 'visible', candidates: 'visible', factors: 'visible' };

  const updatePrivacy = async (key: string, val: string) => {
    const newPrivacy = { ...currentPrivacy, [key]: val };
    
    // Optimistic / Fire-and-forget for UI responsiveness
    const { error } = await supabase
      .from('lobbies')
      .update({ settings: { ...settings, privacy: newPrivacy } })
      .eq('id', lobbyId);
      
    if (!error) toast.success(t('privacy_updated'));
  };

  const handleSuspend = async () => {
    // 1. Optimistic Update (Switch View Immediately)
    if (onSuspend) onSuspend();
    
    // 2. DB Update
    const { error } = await supabase
      .from('lobbies')
      .update({ status: 'setup' })
      .eq('id', lobbyId);

    if (error) {
        toast.error(t('end_error'));
    } else {
        toast.success("Lobby Suspended");
        onClose(); 
    }
  };

  // Define the sections for the map loop
  const sections = ['users', 'candidates', 'factors'] as const;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('title')}>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700 pb-2">
        <button 
            onClick={() => setTab('privacy')} 
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${tab === 'privacy' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
            {t('tab_privacy')}
        </button>
        <button 
            onClick={() => setTab('manage')} 
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${tab === 'manage' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
            {t('tab_manage')}
        </button>
      </div>

      {/* Privacy Tab */}
      {tab === 'privacy' && (
        <div className="space-y-4">
            {sections.map((section) => (
                <div key={section} className="flex items-center justify-between bg-gray-800 p-3 rounded-xl border border-gray-700">
                    <span className="font-bold text-sm text-gray-300 capitalize">
                        {t(`privacy_sections.${section}` as any)}
                    </span>
                    <div className="flex bg-black/40 rounded-lg p-1">
                        <button 
                            onClick={() => updatePrivacy(section, 'visible')}
                            className={`p-1.5 rounded-md transition-all ${currentPrivacy[section] !== 'hidden' ? 'bg-green-500/20 text-green-400' : 'text-gray-600 hover:text-gray-400'}`}
                            title="Visible"
                        >
                            <Eye size={16} />
                        </button>
                        <button 
                            onClick={() => updatePrivacy(section, 'hidden')}
                            className={`p-1.5 rounded-md transition-all ${currentPrivacy[section] === 'hidden' ? 'bg-red-500/20 text-red-400' : 'text-gray-600 hover:text-gray-400'}`}
                            title="Hidden"
                        >
                            <EyeOff size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* Manage Tab */}
      {tab === 'manage' && (
        <div className="space-y-6 text-center">
            <div className="bg-yellow-900/20 border border-yellow-500/20 p-4 rounded-xl">
                <p className="text-xs text-yellow-200/80 mb-4 leading-relaxed">
                    {t('suspend_desc')}
                </p>
                <Button variant="danger" onClick={handleSuspend} className="w-full justify-center">
                    <PauseCircle size={18} className="mr-2" /> {t('suspend_vote')}
                </Button>
            </div>
        </div>
      )}
    </Modal>
  );
};