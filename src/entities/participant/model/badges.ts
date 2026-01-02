export type BadgeType = 'hater' | 'lover' | 'contrarian' | 'oracle' | 'hive_mind';

interface UserStat {
  userId: string;
  avgScore: number;      // Average score given by this user across all candidates
  deviation: number;     // How far their votes are from the group average
  topPickId: string;     // The candidate they gave the highest score to
  maxScore: number;      // The highest score they gave
}

export const calculateBadges = (
  votes: any[], 
  winnerId: string, 
  // optional: candidates count or factors could be passed for deeper analysis
): Record<string, BadgeType[]> => {
  if (!votes || votes.length === 0) return {};

  const userStats: Record<string, UserStat> = {};
  const allScores: number[] = [];

  // 1. Aggregation: Calculate per-user stats
  votes.forEach(v => {
    if (!userStats[v.voter_id]) {
      userStats[v.voter_id] = { 
        userId: v.voter_id, 
        avgScore: 0, 
        deviation: 0, 
        topPickId: '', 
        maxScore: -1 
      };
    }

    const scores = Object.values(v.scores).map(val => Number(val));
    const voteSum = scores.reduce((a, b) => a + b, 0);
    const voteAvg = scores.length ? voteSum / scores.length : 0;

    // Track global scores for group average
    allScores.push(voteAvg);

    // Update User Running Stats (Simplified: we treat each vote row as a separate entry, 
    // but usually 1 row = 1 candidate. So we average the averages later)
    // Actually, let's store arrays first to be precise.
  });

  // Re-loop properly with grouped data
  const votesByUser: Record<string, any[]> = {};
  votes.forEach(v => {
    if (!votesByUser[v.voter_id]) votesByUser[v.voter_id] = [];
    votesByUser[v.voter_id].push(v);
  });

  const statsList: UserStat[] = [];

  Object.entries(votesByUser).forEach(([uid, userVotes]) => {
    let totalUserScore = 0;
    let totalItems = 0;
    let bestCandId = "";
    let highestScoreFound = -1;

    userVotes.forEach(v => {
      const s = Object.values(v.scores).map(x => Number(x));
      const sum = s.reduce((a, b) => a + b, 0);
      totalUserScore += sum;
      totalItems += s.length;

      // Find their favorite
      if (sum > highestScoreFound) {
        highestScoreFound = sum;
        bestCandId = v.candidate_id;
      }
    });

    const avg = totalItems ? totalUserScore / totalItems : 0;
    
    statsList.push({
      userId: uid,
      avgScore: avg,
      deviation: 0, // Calculated next
      topPickId: bestCandId,
      maxScore: highestScoreFound
    });
  });

  if (statsList.length < 2) return {};

  // 2. Calculate Group Average & Deviation
  const groupSum = statsList.reduce((a, b) => a + b.avgScore, 0);
  const groupAvg = groupSum / statsList.length;

  statsList.forEach(stat => {
    stat.deviation = Math.abs(stat.avgScore - groupAvg);
  });

  // 3. Assign Badges
  const badges: Record<string, BadgeType[]> = {};
  const addBadge = (uid: string, b: BadgeType) => {
    if (!badges[uid]) badges[uid] = [];
    if (!badges[uid].includes(b)) badges[uid].push(b);
  };

  // Sorts for assignments
  const byScore = [...statsList].sort((a, b) => a.avgScore - b.avgScore);
  const byDeviation = [...statsList].sort((a, b) => a.deviation - b.deviation);

  // HATER: Lowest Average Score
  addBadge(byScore[0].userId, 'hater');

  // LOVER: Highest Average Score
  addBadge(byScore[byScore.length - 1].userId, 'lover');

  // HIVE MIND: Lowest Deviation (Closest to average)
  addBadge(byDeviation[0].userId, 'hive_mind');

  // CONTRARIAN: Highest Deviation (Furthest from average)
  // Only assign if deviation is significant (> 10% of scale usually, but simple here)
  if (byDeviation[byDeviation.length - 1].deviation > 0.5) {
    addBadge(byDeviation[byDeviation.length - 1].userId, 'contrarian');
  }

  // ORACLE: Voted most heavily for the eventual winner
  statsList.forEach(stat => {
    if (stat.topPickId === winnerId) {
      addBadge(stat.userId, 'oracle');
    }
  });

  return badges;
};