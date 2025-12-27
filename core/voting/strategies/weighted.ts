import { VotingStrategy, VotingResult } from '../types';
import { calculateMean } from '../../math/statistics';

// Quanto vale un Jolly? Es. aumenta il peso del voto del 25%
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
                    // Inverti se "lower_better" (es. prezzo basso è meglio)
                    if (factor.trend === 'lower_better') val = maxScale - val;
                    
                    voteTotal += val * factor.weight;
                    totalWeight += factor.weight;
                });

                // Normalizza il voto singolo (media pesata dei fattori)
                let finalVoteValue = totalWeight > 0 ? voteTotal / totalWeight : 0;

                // APPLICA IL JOLLY
                if (vote.is_jolly) {
                    finalVoteValue *= JOLLY_MULTIPLIER;
                }

                weightedSum.push(finalVoteValue);
            });
            
            // Punteggio finale candidato = Media di tutti i voti ricevuti
            scores[cand.id] = calculateMean(weightedSum);
        });

        // Ordina
        const ranking = [...candidates].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));

        return { ranking, scores, details: null, stats: {} };
    }
};