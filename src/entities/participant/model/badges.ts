import { calculateZScores } from '@/shared/lib/voting-math';

interface VoteStat {
  userId: string;
  avgScore: number;
  deviation: number;
  winnerPick: string;
}

export type BadgeType = 'hater' | 'lover' | 'contrarian' | 'oracle' | 'hive_mind';

export const calculateBadges = (
  votes: any[], 
  winnerId: string, 
  globalAvg: number
): Record<string, BadgeType[]> => {
  const userStats: Record<string, VoteStat> = {};
  
  // 1. Aggregation
  votes.forEach(v => {
    if (!userStats[v.voter_id]) {
      userStats[v.voter_id] = { userId: v.voter_id, avgScore: 0, deviation: 0, winnerPick: '' };
    }
    const scores = Object.values(v.scores).map(Number);
    const avg = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
    
    // Simple logic: highest score given by user is their "Pick"
    // In a real app, this would be more complex
    userStats[v.voter_id].avgScore += avg;
  });

  const stats = Object.values(userStats);
  if (stats.length < 2) return {}; // Need comparison

  // 2. Determine Badges
  const sortedByAvg = [...stats].sort((a, b) => a.avgScore - b.avgScore);
  const badges: Record<string, BadgeType[]> = {};

  const addBadge = (uid: string, type: BadgeType) => {
    if (!badges[uid]) badges[uid] = [];
    badges[uid].push(type);
  };

  // Hater (Lowest Avg) & Lover (Highest Avg)
  addBadge(sortedByAvg[0].userId, 'hater');
  addBadge(sortedByAvg[stats.length - 1].userId, 'lover');

  // Oracle (Voted for winner with highest score - simplified)
  // Logic: Check if their highest vote was for winnerId (omitted for brevity, requires joining candidate data)

  return badges;
};