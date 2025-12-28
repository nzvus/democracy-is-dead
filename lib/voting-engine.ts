import { Candidate, Factor } from '@/types';
import { VoteRecord } from '@/core/voting/types';


export const normalizeVotes = (
  candidates: Candidate[],
  votes: VoteRecord[],
  factors: Factor[],
  maxScale: number
): Record<string, number> => {
  const scores: Record<string, number> = {};

  candidates.forEach(cand => {
    const candVotes = votes.filter(v => v.candidate_id === cand.id);
    const allNormalizedScores: number[] = []; 
 
    candVotes.forEach(vote => {
      let voteTotal = 0;
      let totalWeight = 0;

      factors.forEach(factor => {
        let val = vote.scores[factor.id] || 0;
        
        if (factor.trend === 'lower_better') val = maxScale - val;
        
        voteTotal += val * factor.weight;
        totalWeight += factor.weight;
      });

      
      const normalized = totalWeight > 0 ? (voteTotal / totalWeight) / maxScale : 0;
      allNormalizedScores.push(normalized);
    });

    
    if (allNormalizedScores.length > 0) {
      scores[cand.id] = allNormalizedScores.reduce((a, b) => a + b, 0) / allNormalizedScores.length;
    } else {
      scores[cand.id] = 0;
    }
  });

  return scores;
};