import { VotingStrategy } from '../types';
import { Election } from 'caritat';

export const SchulzeStrategy: VotingStrategy = {
    name: 'schulze',
    calculate(candidates, votes, factors, options) {
        const maxScale = options?.maxScale || 10;
        
        // 1. Preparazione Ballots (Preferenze)
        const voterIds = Array.from(new Set(votes.map(v => v.voter_id)));
        const ballots: string[][] = [];

        voterIds.forEach(voterId => {
            const userVotes = candidates.map(cand => {
                const vote = votes.find(v => v.voter_id === voterId && v.candidate_id === cand.id);
                // Se non votato, diamo -1 (ultimo)
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

            // Crea classifica: [PrimoID, SecondoID, ...]
            const ballot = userVotes
                .sort((a, b) => b.score - a.score)
                .map(u => u.id);
            
            ballots.push(ballot);
        });

        // 2. Calcolo Matrice dei Duelli (Pairwise Matrix)
        // matrix[A][B] = Quanti preferiscono A rispetto a B
        const matrix: Record<string, Record<string, number>> = {};
        
        // Inizializza
        candidates.forEach(a => {
            matrix[a.id] = {};
            candidates.forEach(b => {
                matrix[a.id][b.id] = 0;
            });
        });

        // Popola
        ballots.forEach(ballot => {
            for (let i = 0; i < ballot.length; i++) {
                for (let j = i + 1; j < ballot.length; j++) {
                    const winner = ballot[i];
                    const loser = ballot[j];
                    if (matrix[winner] && matrix[winner][loser] !== undefined) {
                        matrix[winner][loser]++;
                    }
                }
            }
        });

        // 3. Esegui Schulze con Caritat
        const election = new Election({ candidates: candidates.map(c => c.id) });
        ballots.forEach(b => election.addBallot(b));
        const winners = election.schulze();

        // 4. Costruisci il Ranking Finale
        // Schulze puro restituisce solo il set di vincitori (spesso 1). 
        // Per gli altri, usiamo il numero di vittorie pairwise come criterio di ordinamento secondario (Copeland score semplificato)
        // o semplicemente mettiamo i vincitori Schulze in cima.
        const scores: Record<string, number> = {};
        candidates.forEach(c => {
            // Punteggio "Copeland" grezzo per ordinamento UI: quante sfide 1v1 vince?
            let wins = 0;
            candidates.forEach(opponent => {
                if (c.id !== opponent.id) {
                    if (matrix[c.id][opponent.id] > matrix[opponent.id][c.id]) wins++;
                }
            });
            scores[c.id] = wins;
        });

        // I vincitori Schulze devono stare sempre in cima, indipendentemente dal copeland score
        const ranking = [...candidates].sort((a, b) => {
            const aIsWinner = winners.includes(a.id);
            const bIsWinner = winners.includes(b.id);
            if (aIsWinner && !bIsWinner) return -1;
            if (!aIsWinner && bIsWinner) return 1;
            return scores[b.id] - scores[a.id]; // Fallback su vittorie dirette
        });

        return { 
            ranking, 
            scores, 
            details: { matrix, winners }, 
            stats: {} 
        };
    }
};