import { VotingStrategy } from '../types';

export const BordaStrategy: VotingStrategy = {
    name: 'borda',
    calculate(candidates, votes, factors, options) {
        const scores: Record<string, number> = {};
        const maxScale = options?.maxScale || 10;
        
        // Inizializza a 0
        candidates.forEach(c => scores[c.id] = 0);

        // Raggruppa voti per utente (Simula una scheda elettorale)
        const voterIds = Array.from(new Set(votes.map(v => v.voter_id)));

        voterIds.forEach(voterId => {
            // 1. Calcola il punteggio grezzo che l'utente ha dato a ogni candidato
            const userPreferences = candidates.map(cand => {
                const vote = votes.find(v => v.voter_id === voterId && v.candidate_id === cand.id);
                if (!vote) return { id: cand.id, rawScore: -1 }; // Non votato

                let rawScore = 0;
                factors.forEach(f => {
                    let val = vote.scores[f.id] || 0;
                    if (f.trend === 'lower_better') val = maxScale - val;
                    rawScore += val * f.weight;
                });
                
                // Il Jolly nel Borda potrebbe servire per rompere i pareggi, 
                // ma tradizionalmente Borda è posizionale. 
                // Qui usiamo il rawScore solo per ordinare.
                if (vote.is_jolly) rawScore += 0.001; // Piccolo nudge per preferenza

                return { id: cand.id, rawScore };
            });

            // 2. Ordina candidati in base al punteggio dell'utente (dal migliore al peggiore)
            userPreferences.sort((a, b) => b.rawScore - a.rawScore);

            // 3. Assegna punti Borda (N-1 al primo, 0 all'ultimo)
            userPreferences.forEach((pref, index) => {
                // Se rawScore è -1 (non votato), decidi se dare 0 o saltare. Diamo 0.
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