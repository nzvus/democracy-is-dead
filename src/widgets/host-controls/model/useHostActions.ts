import { createClient } from '@/shared/api/supabase';
import { toast } from 'sonner';
import { LobbySettings } from '@/entities/lobby/model/types';

export const useHostActions = (lobbyId: string, currentSettings: LobbySettings) => {
  const supabase = createClient();

  const togglePrivacy = async () => {
    const newMode = currentSettings.privacy === 'anonymous' ? 'public' : 'anonymous';
    
    // Optimistic update handled by Realtime in the UI, 
    // here we just send the command.
    const { error } = await supabase
      .from('lobbies')
      .update({ 
        settings: { ...currentSettings, privacy: newMode } 
      })
      .eq('id', lobbyId);

    if (error) toast.error("Failed to update privacy");
    else toast.success(`Privacy set to: ${newMode}`);
  };

  const endVoting = async () => {
    const { error } = await supabase
      .from('lobbies')
      .update({ status: 'ended' })
      .eq('id', lobbyId);

    if (error) toast.error("Failed to end voting");
  };

  return { togglePrivacy, endVoting };
};