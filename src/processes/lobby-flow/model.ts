import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/shared/api/supabase';
import { Lobby, LobbyStatus } from '@/entities/lobby/model/types';
import { Candidate } from '@/entities/candidate/model/types';
import { Factor } from '@/entities/factor/model/types'; // [NEW] Import Factor type
import { Participant } from '@/entities/participant/model/types';
import { toast } from 'sonner';

export const useLobbyState = (initialLobbyId: string) => {
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [factors, setFactors] = useState<Factor[]>([]); // [NEW] Factors State
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = useMemo(() => createClient(), []);

  // --- Fetchers ---

  const fetchCandidates = useCallback(async () => {
    const { data } = await supabase.from('candidates').select('*').eq('lobby_id', initialLobbyId);
    if (data) setCandidates(data);
  }, [initialLobbyId, supabase]);

  // [NEW] Fetch Factors
  const fetchFactors = useCallback(async () => {
    const { data } = await supabase.from('factors').select('*').eq('lobby_id', initialLobbyId);
    if (data) setFactors(data);
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
      if (newStatus === 'voting') {
        fetchCandidates();
        fetchFactors();
      }
      if (newStatus === 'ended') fetchVotes();
    }
  };

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchCandidates(), fetchFactors()]);
  }, [fetchCandidates, fetchFactors]);

  // --- Effects ---

  useEffect(() => {
    const fetchData = async () => {
      const { data: lobbyData, error } = await supabase.from('lobbies').select('*').eq('id', initialLobbyId).single();
      if (error || !lobbyData) { toast.error("Lobby not found"); return; }
      
      setLobby(lobbyData);

      // Fetch dynamic data if active
      if (lobbyData.status !== 'waiting') {
        await fetchCandidates();
        await fetchFactors(); // [NEW] Fetch factors
      }
      
      await fetchParticipants();

      if (lobbyData.status === 'ended') {
        await fetchVotes();
      }
      
      setLoading(false);
    };

    fetchData();

    // --- Realtime Subscriptions ---
    const lobbyChannel = supabase.channel(`lobby_main:${initialLobbyId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lobbies', filter: `id=eq.${initialLobbyId}` },
        (payload) => {
          const newLobby = payload.new as Lobby;
          setLobby(newLobby);
          
          if (payload.old.status !== 'voting' && newLobby.status === 'voting') {
             fetchCandidates();
             fetchFactors();
          }
          if (newLobby.status === 'ended') fetchVotes();
        }
      )
      .subscribe();

    const candidateChannel = supabase.channel(`lobby_cands:${initialLobbyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates', filter: `lobby_id=eq.${initialLobbyId}` },
        () => fetchCandidates()
      )
      .subscribe();

    // [NEW] Subscribe to Factors changes
    const factorChannel = supabase.channel(`lobby_factors:${initialLobbyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'factors', filter: `lobby_id=eq.${initialLobbyId}` },
        () => fetchFactors()
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
      supabase.removeChannel(factorChannel);
      supabase.removeChannel(partsChannel);
      supabase.removeChannel(voteChannel);
    };
  }, [initialLobbyId, supabase, fetchCandidates, fetchFactors, fetchParticipants, fetchVotes, lobby?.status]);

  return { 
    lobby, 
    candidates, 
    factors, // [NEW] Export factors
    participants, 
    votes, 
    loading, 
    updateLocalStatus, 
    refreshAll 
  };
};