
import { useState, useEffect, useMemo } from 'react';
import { submitVote } from '../api/vote-api';
import { createClient } from '@/shared/api/supabase';
import { toast } from 'sonner';

export const useCastVote = (lobbyId: string, userId: string) => {
  const [localVotes, setLocalVotes] = useState<Record<string, Record<string, number>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true); // [NEW] Track initial data fetch
  
  const supabase = useMemo(() => createClient(), []);

  // Restore existing votes on mount or when lobby/user changes
  useEffect(() => {
    let isMounted = true;

    const fetchExistingVotes = async () => {
      if (!userId || !lobbyId) return;
      
      setIsFetching(true);
      try {
        const { data, error } = await supabase
          .from('votes')
          .select('candidate_id, scores')
          .eq('lobby_id', lobbyId)
          .eq('voter_id', userId);

        if (error) throw error;

        if (isMounted && data && data.length > 0) {
          const voteMap: Record<string, Record<string, number>> = {};
          
          data.forEach((vote: any) => {
            // Ensure scores is treated as an object (Supabase JSONB)
            voteMap[vote.candidate_id] = vote.scores || {};
          });
          
          setLocalVotes(voteMap);
        }
      } catch (err) {
        console.error("Error fetching previous votes:", err);
        // Optional: toast.error("Could not load previous votes");
      } finally {
        if (isMounted) setIsFetching(false);
      }
    };

    fetchExistingVotes();

    return () => { isMounted = false; };
  }, [lobbyId, userId, supabase]);

  const registerVote = (candidateId: string, factorId: string, value: number) => {
    setLocalVotes(prev => ({
      ...prev,
      [candidateId]: {
        ...(prev[candidateId] || {}),
        [factorId]: value
      }
    }));
  };

  const commitVotes = async () => {
    setIsSubmitting(true);
    
    // Flatten localVotes into an array of promises
    const promises = Object.entries(localVotes).map(([candidateId, scores]) => 
      submitVote({
        lobby_id: lobbyId,
        voter_id: userId,
        candidate_id: candidateId,
        scores
      })
    );

    try {
      if (promises.length === 0) {
        toast.info("No votes to submit.");
        return;
      }
      await Promise.all(promises);
      toast.success("Votes submitted successfully!");
    } catch (e) {
      toast.error("Failed to submit votes.");
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    localVotes,
    registerVote,
    commitVotes,
    isSubmitting,
    isFetching // [NEW] Expose fetching state
  };
};