import { Participant } from '@/types';
import { VoteRecord, VotingResult } from '../voting/types';
import { calculateMean, calculateStdDev } from '../math/statistics';

export type BadgeType = 'hater' | 'lover' | 'contrarian' | 'oracle' | 'hive_mind';

export interface UserGamificationStats {
    userId: string;
    avgScore: number;
    stdDev: number;
    agreementScore: number;
    badges: BadgeType[];
}

export const getBadgeIcon = (type: BadgeType) => {
    switch(type) {
        case 'hater': return '🤬'
        case 'lover': return '😍'
        case 'hive_mind': return '🐝'
        case 'contrarian': return '🦄'
        case 'oracle': return '🔮'
        default: return '🏅'
    }
}

export const calculateAwards = (
    participants: Participant[],
    votes: VoteRecord[],
    schulzeResult: VotingResult, 
    // Parametri rimossi perché inutilizzati: weightedResult, maxScale
): Record<string, BadgeType[]> => {
    
    if (participants.length < 3) return {};

    const stats: UserGamificationStats[] = [];
    
    participants.forEach(p => {
        const userVotes = votes.filter(v => v.voter_id === p.user_id);
        if (userVotes.length === 0) return;

        const allScores: number[] = [];
        userVotes.forEach(v => allScores.push(...Object.values(v.scores)));
        
        if (allScores.length === 0) return;

        const userMean = calculateMean(allScores);
        const userStd = calculateStdDev(allScores, userMean);

        let oraclePoints = 0;
        if (schulzeResult.ranking.length > 0) {
            const schulzeWinnerId = schulzeResult.ranking[0].id;
            let bestCandId = "";
            let maxScore = -1;

            userVotes.forEach(uv => {
                const sum = Object.values(uv.scores).reduce((a,b)=>a+b, 0);
                if (sum > maxScore) {
                    maxScore = sum;
                    bestCandId = uv.candidate_id;
                }
            });

            if (bestCandId === schulzeWinnerId) {
                oraclePoints = 100;
            }
        }

        stats.push({
            userId: p.user_id,
            avgScore: userMean,
            stdDev: userStd,
            agreementScore: oraclePoints,
            badges: []
        });
    });

    if (stats.length < 2) return {};

    stats.sort((a, b) => a.avgScore - b.avgScore);
    const critic = stats[0]; 
    const optimist = stats[stats.length - 1]; 

    const byDev = [...stats].sort((a, b) => a.stdDev - b.stdDev);
    const hiveMind = byDev[0];
    const maverick = byDev[byDev.length - 1];

    const result: Record<string, BadgeType[]> = {};
    stats.forEach(s => result[s.userId] = []);

    if (critic) result[critic.userId].push('hater');
    if (optimist) result[optimist.userId].push('lover');
    if (maverick && maverick.stdDev > 2.0) result[maverick.userId].push('contrarian');
    if (hiveMind) result[hiveMind.userId].push('hive_mind');

    const oracles = stats.filter(s => s.agreementScore === 100);
    oracles.forEach(o => result[o.userId].push('oracle'));

    return result;
};