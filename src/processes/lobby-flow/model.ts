import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/shared/api/supabase';
import { Lobby, LobbyStatus } from '@/entities/lobby/model/types';
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

  // Fetchers
  const fetchCandidates = useCallback(async () => {
    const { data } = await supabase.from('candidates').select('*').eq('lobby_id', initialLobbyId);
    if (data) setCandidates(data);
  }, [initialLobbyId, supabase]);

  const fetchParticipants = useCallback(async () => {
    const { data } = await supabase.rpc('get_secure_participants', { target_lobby_id: initialLobbyId });
    if (data) setParticipants(data as unknown as Participant[]);
  }, [initialLobbyId, supabase]);

  const fetchVotes = useCallback(async () => {
    const { data } = await supabase.from('votes').select('*').eq('lobby_id', initialLobbyId);
    setVotes(data || []);
  }, [initialLobbyId, supabase]);

  // [NEW] Manual State Updater (Optimistic UI)
  const updateLocalStatus = (newStatus: LobbyStatus) => {
    if (lobby) {
      setLobby({ ...lobby, status: newStatus });
      // If entering voting, ensure candidates are ready
      if (newStatus === 'voting') fetchCandidates();
      // If entering results, ensure votes are ready
      if (newStatus === 'ended') fetchVotes();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: lobbyData, error } = await supabase.from('lobbies').select('*').eq('id', initialLobbyId).single();
      if (error || !lobbyData) { toast.error("Lobby not found"); return; }
      
      setLobby(lobbyData);

      if (lobbyData.status !== 'waiting') await fetchCandidates();
      await fetchParticipants();
      if (lobbyData.status === 'ended') await fetchVotes();
      
      setLoading(false);
    };

    fetchData();

    // Realtime Subscriptions
    const lobbyChannel = supabase.channel(`lobby_main:${initialLobbyId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lobbies', filter: `id=eq.${initialLobbyId}` },
        (payload) => {
          const newLobby = payload.new as Lobby;
          setLobby(newLobby);
          
          // React to status changes from OTHER users/devices
          if (payload.old.status !== 'voting' && newLobby.status === 'voting') fetchCandidates();
          if (newLobby.status === 'ended') fetchVotes();
        }
      )
      .subscribe();

    const candidateChannel = supabase.channel(`lobby_cands:${initialLobbyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates', filter: `lobby_id=eq.${initialLobbyId}` },
        () => fetchCandidates()
      )
      .subscribe();

    const partsChannel = supabase.channel(`lobby_parts:${initialLobbyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lobby_participants', filter: `lobby_id=eq.${initialLobbyId}` },
        () => fetchParticipants()
      )
      .subscribe();

    const voteChannel = supabase.channel(`lobby_votes:${initialLobbyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes', filter: `lobby_id=eq.${initialLobbyId}` },
        () => {
            if (lobby?.status === 'ended') fetchVotes();
        }
      )
      .subscribe();

    return () => { 
      supabase.removeChannel(lobbyChannel); 
      supabase.removeChannel(candidateChannel);
      supabase.removeChannel(partsChannel);
      supabase.removeChannel(voteChannel);
    };
  }, [initialLobbyId, supabase, fetchCandidates, fetchParticipants, fetchVotes, lobby?.status]);

  return { lobby, candidates, participants, votes, loading, updateLocalStatus, refreshCandidates: fetchCandidates };
};