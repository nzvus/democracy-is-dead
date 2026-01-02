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

  // Helper to fetch candidates
  const fetchCandidates = useCallback(async () => {
    const { data } = await supabase.from('candidates').select('*').eq('lobby_id', initialLobbyId);
    if (data) setCandidates(data);
  }, [initialLobbyId, supabase]);

  const fetchParticipants = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_secure_participants', { 
      target_lobby_id: initialLobbyId 
    });
    if (!error && data) setParticipants(data as unknown as Participant[]);
  }, [initialLobbyId, supabase]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: lobbyData, error } = await supabase.from('lobbies').select('*').eq('id', initialLobbyId).single();
      if (error || !lobbyData) { toast.error("Lobby not found"); return; }
      
      setLobby(lobbyData);

      // Always try to fetch candidates if not waiting, just in case
      if (lobbyData.status !== 'waiting') await fetchCandidates();
      
      await fetchParticipants();

      if (lobbyData.status === 'ended') {
        const { data: v } = await supabase.from('votes').select('*').eq('lobby_id', initialLobbyId);
        setVotes(v || []);
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
          if (payload.old.status === 'setup' && newLobby.status === 'voting') {
             fetchCandidates(); // Force fetch when launching
          }
        }
      )
      .subscribe();

    // [FIX] Listen for Candidates being added
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

    return () => { 
      supabase.removeChannel(lobbyChannel); 
      supabase.removeChannel(candidateChannel);
      supabase.removeChannel(partsChannel);
    };
  }, [initialLobbyId, supabase, fetchCandidates, fetchParticipants]);

  return { lobby, candidates, participants, votes, loading };
};