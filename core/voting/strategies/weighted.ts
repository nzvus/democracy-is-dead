import { VotingStrategy } from '../types'; 
import { calculateMean } from '../../math/statistics';

const JOLLY_MULTIPLIER = 1.25; 

export const WeightedStrategy: VotingStrategy = {
    name: 'weighted',
    calculate(candidates, votes, factors, options) {
        const scores: Record<string, number> = {};
        const maxScale = options?.maxScale || 10;

        candidates.forEach(cand => {
            const candVotes = votes.filter(v => v.candidate_id === cand.id);
            const weightedSum: number[] = [];

            candVotes.forEach(vote => {
                let voteTotal = 0;
                let totalWeight = 0;

                factors.forEach(factor => {
                    let val = vote.scores[factor.id] || 0;
                    if (factor.trend === 'lower_better') val = maxScale - val;
                    
                    voteTotal += val * factor.weight;
                    totalWeight += factor.weight;
                });

                let finalVoteValue = totalWeight > 0 ? voteTotal / totalWeight : 0;

                if (vote.is_jolly) {
                    finalVoteValue *= JOLLY_MULTIPLIER;
                }

                weightedSum.push(finalVoteValue);
            });
            
            scores[cand.id] = calculateMean(weightedSum);
        });

        const ranking = [...candidates].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));

        
        return { ranking, scores, details: null, stats: {} };
    }
}; 