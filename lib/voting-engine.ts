import { Candidate, Factor } from '@/types';
import { VoteRecord } from '@/core/voting/types';

// Helper per normalizzare i voti (0-1)
export const normalizeVotes = (
  candidates: Candidate[],
  votes: VoteRecord[],
  factors: Factor[],
  maxScale: number
): Record<string, number> => {
  const scores: Record<string, number> = {};

  candidates.forEach(cand => {
    const candVotes = votes.filter(v => v.candidate_id === cand.id);
    const allNormalizedScores: number[] = []; // <--- FIX: const

    candVotes.forEach(vote => {
      let voteTotal = 0;
      let totalWeight = 0;

      factors.forEach(factor => {
        let val = vote.scores[factor.id] || 0;
        // Inverti se lower_better
        if (factor.trend === 'lower_better') val = maxScale - val;
        
        voteTotal += val * factor.weight;
        totalWeight += factor.weight;
      });

      // Normalizza 0-1
      const normalized = totalWeight > 0 ? (voteTotal / totalWeight) / maxScale : 0;
      allNormalizedScores.push(normalized);
    });

    // Media semplice dei voti normalizzati
    if (allNormalizedScores.length > 0) {
      scores[cand.id] = allNormalizedScores.reduce((a, b) => a + b, 0) / allNormalizedScores.length;
    } else {
      scores[cand.id] = 0;
    }
  });

  return scores;
};