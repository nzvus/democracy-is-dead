import { useState, useEffect, useMemo } from 'react';
import { submitVote } from '../api/vote-api';
import { createClient } from '@/shared/api/supabase';
import { toast } from 'sonner';

export const useCastVote = (lobbyId: string, userId: string) => {
  const [localVotes, setLocalVotes] = useState<Record<string, Record<string, number>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  // [NEW] Restore existing votes on mount
  useEffect(() => {
    const fetchExistingVotes = async () => {
      const { data } = await supabase
        .from('votes')
        .select('*')
        .eq('lobby_id', lobbyId)
        .eq('voter_id', userId);

      if (data && data.length > 0) {
        const voteMap: Record<string, Record<string, number>> = {};
        data.forEach((vote: any) => {
          voteMap[vote.candidate_id] = vote.scores;
        });
        setLocalVotes(voteMap);
      }
    };

    if (userId && lobbyId) fetchExistingVotes();
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
    const promises = Object.entries(localVotes).map(([candidateId, scores]) => 
      submitVote({
        lobby_id: lobbyId,
        voter_id: userId,
        candidate_id: candidateId,
        scores
      })
    );

    try {
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
    isSubmitting
  };
};