import { Candidate, Factor } from '@/types';

export interface VoteRecord {
    candidate_id: string;
    voter_id: string;
    scores: Record<string, number>; // factor_id -> value
    is_jolly: boolean;
}

export interface VotingResult {
    ranking: Candidate[]; 
    scores: Record<string, number>; 
    details: Record<string, unknown> | null; // <--- FIX: unknown invece di any
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