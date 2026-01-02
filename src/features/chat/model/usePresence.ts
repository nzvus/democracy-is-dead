import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/shared/api/supabase';
import { PresenceState } from './types';

export const usePresence = (lobbyId: string, userId: string, nickname: string) => {
  const [onlineUsers, setOnlineUsers] = useState<PresenceState[]>([]);
  
  // [FIX] Memoize Supabase client
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const channel = supabase.channel(`presence:${lobbyId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState<PresenceState>();
        const users = Object.values(newState).flat();
        const uniqueUsers = Array.from(new Map(users.map(u => [u.user_id, u])).values());
        setOnlineUsers(uniqueUsers);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            nickname: nickname || 'Anonymous',
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [lobbyId, userId, nickname, supabase]); // [FIX] Added supabase dependency

  return { onlineUsers };
};