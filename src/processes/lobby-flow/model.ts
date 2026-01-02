import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/shared/api/supabase';
import { Lobby } from '@/entities/lobby/model/types';
import { Candidate } from '@/entities/candidate/model/types';
import { Participant } from '@/entities/participant/model/types';
import { toast } from 'sonner';

export const useLobbyState = (initialLobbyId: string) => {
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = useMemo(() => createClient(), []);

  const fetchCandidates = useCallback(async () => {
    const { data } = await supabase.from('candidates').select('*').eq('lobby_id', initialLobbyId);
    if (data) setCandidates(data);
  }, [initialLobbyId, supabase]);

  const fetchParticipants = useCallback(async () => {
    const { data } = await supabase.rpc('get_secure_participants', { target_lobby_id: initialLobbyId });
    if (data) setParticipants(data as unknown as Participant[]);
  }, [initialLobbyId, supabase]);

  const fetchLobby = useCallback(async () => {
    const { data, error } = await supabase.from('lobbies').select('*').eq('id', initialLobbyId).single();
    if (error) toast.error("Lobby not found");
    else setLobby(data);
    return data;
  }, [initialLobbyId, supabase]);

  // Initial Load
  useEffect(() => {
    const init = async () => {
      const lobbyData = await fetchLobby();
      if (!lobbyData) return;

      if (lobbyData.status !== 'waiting') await fetchCandidates();
      await fetchParticipants();
      
      if (lobbyData.status === 'ended') {
        const { data } = await supabase.from('votes').select('*').eq('lobby_id', initialLobbyId);
        setVotes(data || []);
      }
      setLoading(false);
    };
    init();
  }, [fetchLobby, fetchCandidates, fetchParticipants, supabase, initialLobbyId]);

  // Realtime Subscriptions
  useEffect(() => {
    const mainChannel = supabase.channel(`lobby_root:${initialLobbyId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lobbies', filter: `id=eq.${initialLobbyId}` },
        (payload) => {
          const newLobby = payload.new as Lobby;
          setLobby(newLobby);
          // Trigger Candidate fetch on status change
          if (payload.old.status !== 'voting' && newLobby.status === 'voting') {
             fetchCandidates();
          }
        }
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates', filter: `lobby_id=eq.${initialLobbyId}` },
        () => {
            console.log("Candidates changed, refetching..."); // Debug
            fetchCandidates();
        }
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lobby_participants', filter: `lobby_id=eq.${initialLobbyId}` },
        () => fetchParticipants()
      )
      .subscribe();

    return () => { supabase.removeChannel(mainChannel); };
  }, [initialLobbyId, supabase, fetchCandidates, fetchParticipants]);

  return { lobby, candidates, participants, votes, loading };
};