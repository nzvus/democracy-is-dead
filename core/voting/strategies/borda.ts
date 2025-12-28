import { VotingStrategy } from '../types';

export const BordaStrategy: VotingStrategy = {
    name: 'borda',
    calculate(candidates, votes, factors, options) {
        const scores: Record<string, number> = {};
        const maxScale = options?.maxScale || 10;
        
        
        candidates.forEach(c => scores[c.id] = 0);

        
        const voterIds = Array.from(new Set(votes.map(v => v.voter_id)));

        voterIds.forEach(voterId => {
            
            const userPreferences = candidates.map(cand => {
                const vote = votes.find(v => v.voter_id === voterId && v.candidate_id === cand.id);
                if (!vote) return { id: cand.id, rawScore: -1 }; 

                let rawScore = 0;
                factors.forEach(f => {
                    let val = vote.scores[f.id] || 0;
                    if (f.trend === 'lower_better') val = maxScale - val;
                    rawScore += val * f.weight;
                });
                
                
                
                
                if (vote.is_jolly) rawScore += 0.001; 

                return { id: cand.id, rawScore };
            });

            
            userPreferences.sort((a, b) => b.rawScore - a.rawScore);

            
            userPreferences.forEach((pref, index) => {
                
                if (pref.rawScore >= 0) {
                    const points = (candidates.length - 1) - index;
                    scores[pref.id] += points;
                }
            });
        });

        const ranking = [...candidates].sort((a, b) => scores[b.id] - scores[a.id]);
 
        return { ranking, scores, details: null, stats: {} };
    }
};