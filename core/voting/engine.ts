import { Candidate, Factor } from '@/types';
import { VoteRecord, VotingResult, VotingStrategy } from './types';
import { WeightedStrategy } from './strategies/weighted';
import { BordaStrategy } from './strategies/borda';
import { SchulzeStrategy } from './strategies/schulze';

const strategies: Record<string, VotingStrategy> = {
    'weighted': WeightedStrategy,
    'borda': BordaStrategy,
    'schulze': SchulzeStrategy
};

export const calculateResults = (
    system: 'weighted' | 'borda' | 'schulze',
    candidates: Candidate[],
    votes: VoteRecord[],
    factors: Factor[],
    maxScale: number
): VotingResult => {
    const strategy = strategies[system] || WeightedStrategy;
    return strategy.calculate(candidates, votes, factors, { maxScale });
};


export const calculateAllSystems = (
    candidates: Candidate[],
    votes: VoteRecord[],
    factors: Factor[],
    maxScale: number
): Record<string, VotingResult> => {
    return {
        weighted: strategies.weighted.calculate(candidates, votes, factors, { maxScale }),
        borda: strategies.borda.calculate(candidates, votes, factors, { maxScale }),
        schulze: strategies.schulze.calculate(candidates, votes, factors, { maxScale }),
    };
}; 