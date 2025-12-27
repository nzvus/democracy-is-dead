import { VotingStrategy } from '../types';
import { runSchulzeAlgo } from '../algorithms/schulze-logic';

export const SchulzeStrategy: VotingStrategy = {
    name: 'schulze',
    calculate(candidates, votes, factors, options) {
        const maxScale = options?.maxScale || 10;
        
        // 1. Prepara i Ballots (Classifiche)
        // Convertiamo i voti numerici in liste ordinate di preferenze
        const voterIds = Array.from(new Set(votes.map(v => v.voter_id)));
        const ballots: string[][] = [];

        voterIds.forEach(voterId => {
            const userVotes = candidates.map(cand => {
                const vote = votes.find(v => v.voter_id === voterId && v.candidate_id === cand.id);
                // Calcola punteggio pesato
                let score = -1; 
                if (vote) {
                    score = 0;
                    factors.forEach(f => {
                        let val = vote.scores[f.id] || 0;
                        if (f.trend === 'lower_better') val = maxScale - val;
                        score += val * f.weight;
                    });
                }
                return { id: cand.id, score };
            });

            // Filtra solo quelli votati (score >= 0) e ordina
            const validVotes = userVotes.filter(u => u.score >= 0);
            if (validVotes.length > 0) {
                // Ordina per score decrescente (il punteggio più alto è il preferito)
                validVotes.sort((a, b) => b.score - a.score);
                ballots.push(validVotes.map(u => u.id));
            }
        });

        // 2. Esegui algoritmo Schulze proprietario
        const candidateIds = candidates.map(c => c.id);
        const result = runSchulzeAlgo(candidateIds, ballots);

        // 3. Costruisci il risultato finale
        // Assegna punteggi fittizi per l'ordinamento visuale (numero di vittorie beatpath)
        const scores: Record<string, number> = {};
        
        // Calcoliamo un punteggio da 0 a 100 basato sulla forza della vittoria
        candidates.forEach(c => {
            // Per UI: mostriamo quante persone ha battuto nel grafo beatpath
            let beatCount = 0;
            candidates.forEach(opp => {
                if (c.id !== opp.id) {
                    const pStrong = result.strongestPaths[c.id]?.[opp.id] || 0;
                    const pWeak = result.strongestPaths[opp.id]?.[c.id] || 0;
                    if (pStrong > pWeak) beatCount++;
                }
            });
            scores[c.id] = beatCount;
        });

        // Riordina l'array candidates secondo il ranking calcolato
        const ranking = result.ranking
            .map(id => candidates.find(c => c.id === id))
            .filter((c): c is typeof candidates[0] => !!c);

        return { 
            ranking, 
            scores, 
            details: { 
                matrix: result.matrix, // Questa è la matrice pairwise reale (d)
                strongestPaths: result.strongestPaths, 
                winners: result.winners 
            }, 
            stats: {} 
        };
    }
};