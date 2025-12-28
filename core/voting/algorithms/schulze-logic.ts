

export interface SchulzeOutput {
    winners: string[];
    ranking: string[]; 
    matrix: Record<string, Record<string, number>>; 
    strongestPaths: Record<string, Record<string, number>>; 
}

export function runSchulzeAlgo(candidates: string[], ballots: string[][]): SchulzeOutput {
    const n = candidates.length;
    
    const idMap = new Map<string, number>();
    candidates.forEach((c, i) => idMap.set(c, i));

    
    
    const d: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    
    for (const ballot of ballots) {
        
        
        for (let i = 0; i < ballot.length; i++) {
            const winnerId = ballot[i];
            const winnerIdx = idMap.get(winnerId);
            if (winnerIdx === undefined) continue;

            for (let j = i + 1; j < ballot.length; j++) {
                const loserId = ballot[j];
                const loserIdx = idMap.get(loserId);
                if (loserIdx === undefined) continue;

                d[winnerIdx][loserIdx]++;
            }
            
            
            
            
            for (const otherCand of candidates) {
                if (!ballot.includes(otherCand)) {
                    const loserIdx = idMap.get(otherCand)!;
                    d[winnerIdx][loserIdx]++;
                }
            }
        }
    }

    
    const p: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                if (d[i][j] > d[j][i]) {
                    p[i][j] = d[i][j];
                } else {
                    p[i][j] = 0;
                }
            }
        }
    }

    
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

    
    
    const winsCount: Record<string, number> = {};
    candidates.forEach(c => winsCount[c] = 0);

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                if (p[i][j] > p[j][i]) {
                    winsCount[candidates[i]]++;
                }
            }
        }
    }

    
    const ranking = [...candidates].sort((a, b) => winsCount[b] - winsCount[a]);
    const maxWins = winsCount[ranking[0]] || 0;
    const winners = ranking.filter(c => winsCount[c] === maxWins);

    
    const matrixOut: Record<string, Record<string, number>> = {};
    const pathsOut: Record<string, Record<string, number>> = {};

    candidates.forEach((ci, i) => {
        matrixOut[ci] = {};
        pathsOut[ci] = {};
        candidates.forEach((cj, j) => {
            matrixOut[ci][cj] = d[i][j];
            pathsOut[ci][cj] = p[i][j];
        });
    });
   
    return { winners, ranking, matrix: matrixOut, strongestPaths: pathsOut };
}