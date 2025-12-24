// utils/voting-engine.ts

type Vote = {
    voter_id: string;
    candidate_id: string;
    scores: Record<string, number>;
};

type Candidate = {
    id: string;
    name: string;
};

type Factor = {
    id: string;
    weight: number;
};

type Participant = {
    user_id: string;
    nickname: string;
    avatar_seed: string;
};

// --- 1. METODO SCHULZE (CONDORCET) ---
export function calculateSchulze(candidates: Candidate[], votes: Vote[], factors: Factor[]) {
    const n = candidates.length;
    const candidateIds = candidates.map(c => c.id);
    const d: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
    const p: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    // Mappa preferenze pesate
    const voterPreferences: Record<string, Record<string, number>> = {};
    votes.forEach(v => {
        let score = 0;
        factors.forEach(f => score += (v.scores[f.id] || 0) * f.weight);
        if (!voterPreferences[v.voter_id]) voterPreferences[v.voter_id] = {};
        voterPreferences[v.voter_id][v.candidate_id] = score;
    });

    // Matrice Scontri Diretti
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i === j) continue;
            let count = 0;
            const candA = candidateIds[i];
            const candB = candidateIds[j];
            Object.keys(voterPreferences).forEach(voterId => {
                const scoreA = voterPreferences[voterId][candA] || 0;
                const scoreB = voterPreferences[voterId][candB] || 0;
                if (scoreA > scoreB) count++;
            });
            d[i][j] = count;
        }
    }

    // Floyd-Warshall (Beatpaths)
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== j) p[i][j] = d[i][j] > d[j][i] ? d[i][j] : 0;
        }
    }

    for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j && i !== k && j !== k) {
                    p[i][j] = Math.max(p[i][j], Math.min(p[i][k], p[k][j]));
                }
            }
        }
    }

    // Calcolo Vittorie Schulze
    const wins: number[] = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== j && p[i][j] >= p[j][i]) wins[i]++;
        }
    }

    return candidates.map((c, index) => ({
        ...c,
        schulzeWins: wins[index],
        rank: 0
    })).sort((a, b) => b.schulzeWins - a.schulzeWins);
}

// --- 2. CALCOLO MEDIA CLASSICA (Per confronto) ---
export function calculateAverage(candidates: Candidate[], votes: Vote[], factors: Factor[]) {
    return candidates.map(c => {
        const cVotes = votes.filter(v => v.candidate_id === c.id);
        let totalWeighted = 0;
        let count = 0;

        cVotes.forEach(v => {
            factors.forEach(f => {
                totalWeighted += (v.scores[f.id] || 0); // Somma grezza per semplicità display
            });
            count++;
        });
        
        // Media totale (somma fattori / n votanti)
        const avg = count > 0 ? totalWeighted / count : 0;
        return { ...c, avgScore: avg };
    }).sort((a, b) => b.avgScore - a.avgScore);
}

// --- 3. GAMIFICATION: SOCIAL AWARDS 🏆 ---
export function calculateSocialAwards(participants: Participant[], votes: Vote[], factors: Factor[]) {
    if (participants.length < 2 || votes.length === 0) return [];

    // Calcola la media voti data da ogni utente
    const userStats: Record<string, { totalGiven: number, count: number, nick: string, avatar: string }> = {};

    participants.forEach(p => {
        userStats[p.user_id] = { totalGiven: 0, count: 0, nick: p.nickname, avatar: p.avatar_seed };
    });

    votes.forEach(v => {
        if (!userStats[v.voter_id]) return;
        let voteSum = 0;
        factors.forEach(f => voteSum += (v.scores[f.id] || 0));
        userStats[v.voter_id].totalGiven += voteSum;
        userStats[v.voter_id].count += 1; // Un candidato votato
    });

    const results = Object.values(userStats)
        .filter(u => u.count > 0)
        .map(u => ({ ...u, avg: u.totalGiven / u.count }))
        .sort((a, b) => b.avg - a.avg); // Dal più alto al più basso

    if (results.length === 0) return [];

    return [
        {
            title: "L'Entusiasta 😍",
            desc: "Ha dato i voti più alti in media.",
            winner: results[0] // Il primo (avg più alta)
        },
        {
            title: "Il Critico 😤",
            desc: "Ha dato i voti più bassi. Incontentabile.",
            winner: results[results.length - 1] // L'ultimo (avg più bassa)
        }
        // Si potrebbero aggiungere "Il Mainstream" (voti più vicini alla media globale) ecc.
    ];
}