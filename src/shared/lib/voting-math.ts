// --- Statistical Helpers ---

/**
 * Calculates Z-Score for a dataset.
 * Formula: Z = (x - mean) / stdDev
 * Returns array of 0s if stdDev is 0 (all votes identical).
 */
export const calculateZScores = (values: number[]): number[] => {
  if (values.length === 0) return [];
  
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;
  
  const squareDiffs = values.map(v => Math.pow(v - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(avgSquareDiff);

  if (stdDev === 0) return values.map(() => 0);

  return values.map(v => (v - mean) / stdDev);
};

// --- Schulze Method (Beatpath) ---

/**
 * Computes the Schulze Method winner.
 * @param candidates Array of candidate IDs
 * @param ballots Array of ranked preferences (candidate IDs ordered best to worst)
 */
export const calculateSchulze = (candidates: string[], ballots: string[][]) => {
  const n = candidates.length;
  const idx = (id: string) => candidates.indexOf(id);
  
  // 1. Initialize Pairwise Matrix (d[i][j] = number of voters preferring i over j)
  const d: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

  ballots.forEach(ballot => {
    for (let i = 0; i < ballot.length; i++) {
      for (let j = i + 1; j < ballot.length; j++) {
        const winner = idx(ballot[i]);
        const loser = idx(ballot[j]);
        if (winner !== -1 && loser !== -1) d[winner][loser]++;
      }
      // Unranked candidates are assumed to lose against ranked ones
      for (let k = 0; k < n; k++) {
        const candidateId = candidates[k];
        if (!ballot.includes(candidateId)) {
            const winner = idx(ballot[i]);
            if(winner !== -1) d[winner][k]++;
        }
      }
    }
  });

  // 2. Initialize Path Strength Matrix (p)
  const p: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        p[i][j] = d[i][j] > d[j][i] ? d[i][j] : 0;
      }
    }
  }

  // 3. Floyd-Warshall Algorithm for Strongest Paths
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      if (i !== k) {
        for (let j = 0; j < n; j++) {
          if (j !== k && i !== j) {
            p[i][j] = Math.max(p[i][j], Math.min(p[i][k], p[k][j]));
          }
        }
      }
    }
  }

  // 4. Determine Winners
  const wins: Record<string, number> = {};
  candidates.forEach(c => wins[c] = 0);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j && p[i][j] > p[j][i]) {
        wins[candidates[i]]++;
      }
    }
  }

  return {
    ranking: [...candidates].sort((a, b) => wins[b] - wins[a]),
    matrix: d,
    strongestPaths: p
  };
};