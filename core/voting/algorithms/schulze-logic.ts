/**
 * Implementazione pura del Metodo Schulze (Beatpath).
 * Calcola i vincitori e la matrice dei percorsi più forti.
 */

export interface SchulzeOutput {
    winners: string[];
    ranking: string[]; // Ordinati dal vincitore
    matrix: Record<string, Record<string, number>>; // Matrice preferenze (d)
    strongestPaths: Record<string, Record<string, number>>; // Matrice beatpath (p)
}

export function runSchulzeAlgo(candidates: string[], ballots: string[][]): SchulzeOutput {
    const n = candidates.length;
    // Mappa ID -> Indice per velocità
    const idMap = new Map<string, number>();
    candidates.forEach((c, i) => idMap.set(c, i));

    // 1. Inizializza matrici d[i][j] a 0
    // d[i][j] = numero di votanti che preferiscono i a j
    const d: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    // 2. Popola la matrice d basandosi sulle schede (ballots)
    for (const ballot of ballots) {
        // ballot è un array ordinato di ID candidati [1st, 2nd, 3rd...]
        // Per ogni coppia (A, B) nel ballot dove A appare prima di B, incrementa d[A][B]
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
            
            // Gestione dei candidati NON presenti nel ballot (assumiamo siano ultimi a pari merito)
            // Se un candidato non è nel ballot, chi è nel ballot vince contro di lui.
            // (Logica semplificata: chi vota parzialmente preferisce i votati ai non votati)
            for (const otherCand of candidates) {
                if (!ballot.includes(otherCand)) {
                    const loserIdx = idMap.get(otherCand)!;
                    d[winnerIdx][loserIdx]++;
                }
            }
        }
    }

    // 3. Inizializza la matrice p[i][j] (strongest path strengths)
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

    // 4. Floyd-Warshall Algorithm per trovare i beatpaths più forti
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

    // 5. Determina i vincitori e il ranking
    // Un candidato A batte B se p[A][B] > p[B][A]
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

    // Ordina per numero di vittorie Schulze (Copeland method applicato ai beatpaths)
    const ranking = [...candidates].sort((a, b) => winsCount[b] - winsCount[a]);
    const maxWins = winsCount[ranking[0]] || 0;
    const winners = ranking.filter(c => winsCount[c] === maxWins);

    // Formatta le matrici per l'output (usando gli ID come chiavi)
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