import { useState } from 'react';
import { submitVote } from '../api/vote-api';
import { toast } from 'sonner';

export const useCastVote = (lobbyId: string, userId: string) => {
  // Local state for optimistic UI (instant feedback)
  const [localVotes, setLocalVotes] = useState<Record<string, Record<string, number>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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