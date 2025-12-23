// utils/voting-engine.ts

// Tipi di dati
type Vote = {
    voter_id: string;
    candidate_id: string;
    scores: Record<string, number>; // es. { "gusto": 8, "prezzo": 5 }
};

type Candidate = {
    id: string;
    name: string;
};

type Factor = {
    id: string;
    weight: number;
};

// --- 1. NORMALIZZAZIONE (Z-SCORE) ---
// Trasforma i voti grezzi in deviazioni dalla media personale dell'utente [cite: 447]
function normalizeVotes(votes: Vote[], factors: Factor[]) {
    // Raggruppa voti per utente
    const userVotes: Record<string, number[]> = {};
    
    votes.forEach(v => {
        // Calcola il voto "pesato" singolo per questo candidato
        let totalWeightedScore = 0;
        let totalWeight = 0;
        
        factors.forEach(f => {
            const val = v.scores[f.id] || 0;
            totalWeightedScore += val * f.weight;
            totalWeight += f.weight;
        });
        
        const finalScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
        
        if (!userVotes[v.voter_id]) userVotes[v.voter_id] = [];
        userVotes[v.voter_id].push(finalScore);
    });

    // Calcola Media e Deviazione Standard per ogni utente
    const userStats: Record<string, { mean: number; stdDev: number }> = {};
    
    Object.keys(userVotes).forEach(userId => {
        const scores = userVotes[userId];
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
        const stdDev = Math.sqrt(variance) || 1; // Evita divisione per zero
        userStats[userId] = { mean, stdDev };
    });

    return userStats;
}

// --- 2. METODO SCHULZE (Beatpath) ---
// Trova il vincitore di Condorcet risolvendo i cicli [cite: 347, 353]
export function calculateSchulze(candidates: Candidate[], votes: Vote[], factors: Factor[]) {
    const n = candidates.length;
    const candidateIds = candidates.map(c => c.id);
    const d: number[][] = Array(n).fill(0).map(() => Array(n).fill(0)); // Matrice scontri diretti
    const p: number[][] = Array(n).fill(0).map(() => Array(n).fill(0)); // Matrice percorsi più forti

    // 1. Calcoliamo la matrice delle preferenze a coppie (d[i][j])
    // Per ogni coppia di candidati A e B, contiamo quanti preferiscono A > B
    // Usiamo la somma pesata dei fattori per determinare la preferenza
    
    const voterPreferences: Record<string, Record<string, number>> = {};

    // Pre-calcoliamo i punteggi totali per ogni voto per velocità
    votes.forEach(v => {
        let score = 0;
        factors.forEach(f => score += (v.scores[f.id] || 0) * f.weight);
        
        if (!voterPreferences[v.voter_id]) voterPreferences[v.voter_id] = {};
        voterPreferences[v.voter_id][v.candidate_id] = score;
    });

    // Confronto testa a testa
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i === j) continue;
            
            let count = 0;
            const candA = candidateIds[i];
            const candB = candidateIds[j];

            // Contiamo gli elettori che preferiscono A a B
            Object.keys(voterPreferences).forEach(voterId => {
                const scoreA = voterPreferences[voterId][candA] || 0;
                const scoreB = voterPreferences[voterId][candB] || 0;
                if (scoreA > scoreB) count++;
            });

            d[i][j] = count;
        }
    }

    // 2. Inizializzazione percorsi (Floyd-Warshall) 
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

    // 3. Calcolo della forza dei percorsi (The Beatpath)
    for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j && i !== k && j !== k) {
                    p[i][j] = Math.max(p[i][j], Math.min(p[i][k], p[k][j]));
                }
            }
        }
    }

    // 4. Determina il vincitore
    // Un candidato vince se p[i][j] >= p[j][i] per ogni altro j
    const wins: number[] = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                if (p[i][j] >= p[j][i]) {
                    wins[i]++;
                }
            }
        }
    }

    // Restituiamo i risultati ordinati
    return candidates.map((c, index) => ({
        ...c,
        schulzeWins: wins[index], // Quanti avversari batte nel grafo Schulze
        rawScore: 0 // Placeholder per la media classica
    })).sort((a, b) => b.schulzeWins - a.schulzeWins);
}

// --- 3. METODO BORDA ---
// Assegna N punti al primo, N-1 al secondo... [cite: 357]
export function calculateBorda(candidates: Candidate[], votes: Vote[], factors: Factor[]) {
    const bordaScores: Record<string, number> = {};
    candidates.forEach(c => bordaScores[c.id] = 0);

    const voterPrefs = getVoterPreferences(votes, factors);

    Object.keys(voterPrefs).forEach(voterId => {
        // Ordina i candidati per questo utente
        const rankings = Object.entries(voterPrefs[voterId])
            .sort(([, scoreA], [, scoreB]) => scoreB - scoreA) // Dal più alto al più basso
            .map(([id]) => id);

        // Assegna punti: (N-1) al primo, 0 all'ultimo
        rankings.forEach((candId, index) => {
            const points = candidates.length - 1 - index;
            if (bordaScores[candId] !== undefined) {
                bordaScores[candId] += points;
            }
        });
    });

    return candidates.map(c => ({
        ...c,
        bordaScore: bordaScores[c.id] || 0
    })).sort((a, b) => b.bordaScore - a.bordaScore);
}

// Helper: Calcola i punteggi grezzi per utente
function getVoterPreferences(votes: Vote[], factors: Factor[]) {
    const prefs: Record<string, Record<string, number>> = {};
    votes.forEach(v => {
        let score = 0;
        factors.forEach(f => score += (v.scores[f.id] || 0) * f.weight);
        if (!prefs[v.voter_id]) prefs[v.voter_id] = {};
        prefs[v.voter_id][v.candidate_id] = score;
    });
    return prefs;
}