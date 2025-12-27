import { Candidate, Factor } from '@/types';

// Estendiamo il tipo Vote per includere il Jolly
export interface VoteRecord {
    candidate_id: string;
    voter_id: string;
    scores: Record<string, number>; // factor_id -> value
    is_jolly: boolean;
}

export interface VotingResult {
    ranking: Candidate[]; // Lista ordinata dal vincitore
    scores: Record<string, number>; // ID Candidato -> Punteggio Finale
    details: any; // Metadati specifici (es. Matrice Schulze)
    stats: {
        min?: number;
        max?: number;
    }
}

export interface VotingStrategy {
    name: 'weighted' | 'borda' | 'schulze' | 'median';
    calculate(
        candidates: Candidate[], 
        votes: VoteRecord[], 
        factors: Factor[],
        options?: { maxScale: number }
    ): VotingResult;
}