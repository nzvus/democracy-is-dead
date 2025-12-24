import { Candidate, Factor } from '@/types'

// ==========================================
// 1. UTILS MATEMATICI (Z-Score & Scaling)
// ==========================================

const calculateMean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length || 0;

const calculateStdDev = (values: number[], mean: number) => {
  const squareDiffs = values.map(value => Math.pow(value - mean, 2));
  return Math.sqrt(calculateMean(squareDiffs));
};

// Normalizzazione Z-Score: (x - media) / deviazione_standard
// Trasforma i voti in deviazioni dalla media personale del votante
const getZScore = (value: number, allUserVotes: number[]) => {
    if (allUserVotes.length < 2) return 0; // Non abbastanza dati
    const mean = calculateMean(allUserVotes);
    const stdDev = calculateStdDev(allUserVotes, mean);
    if (stdDev === 0) return 0;
    return (value - mean) / stdDev;
};

// Normalizzazione Min-Max (per fattori statici come Prezzo)
const normalizeMinMax = (val: number, min: number, max: number, invert: boolean) => {
    if (max === min) return 0.5;
    let norm = (val - min) / (max - min);
    if (invert) norm = 1 - norm; // Es. Prezzo più basso = punteggio più alto
    return norm; // Output 0.0 - 1.0
};


// ==========================================
// 2. MOTORE DI CALCOLO PRINCIPALE
// ==========================================

export const calculateResults = (
  candidates: Candidate[],
  votes: any[],
  factors: Factor[],
  maxScale: number = 10
) => {
  
  // A. PREPARAZIONE DATI STATICI
  const staticStats: Record<string, { min: number, max: number }> = {};
  factors.filter(f => f.type === 'static').forEach(f => {
    const values = candidates.map(c => c.static_values?.[f.id] || 0);
    staticStats[f.id] = { min: Math.min(...values), max: Math.max(...values) };
  });

  // B. PREPARAZIONE VOTI UTENTI (Z-SCORE)
  // Raggruppa voti per utente per calcolare la loro media personale (Quanto sono severi?)
  const votesByUser: Record<string, number[]> = {};
  votes.forEach(v => {
     Object.values(v.scores).forEach((score: any) => {
         if(!votesByUser[v.voter_id]) votesByUser[v.voter_id] = [];
         votesByUser[v.voter_id].push(Number(score));
     });
  });

  // C. CALCOLO PUNTEGGI PER CANDIDATO
  const results = candidates.map(candidate => {
    let totalWeightedZScore = 0;
    let totalStaticScore = 0;
    let totalWeights = 0;
    
    // Debug info per UI
    const debugDetails: any = {};

    factors.forEach(factor => {
        let factorScore = 0;

        if (factor.type === 'static') {
            // Logica Statica
            const raw = candidate.static_values?.[factor.id] || 0;
            const { min, max } = staticStats[factor.id];
            // Normalizza 0-1
            const normalized = normalizeMinMax(raw, min, max, factor.trend === 'lower_better');
            factorScore = normalized * maxScale; // Riporta in scala (es. 0-10)
            debugDetails[factor.name] = factorScore; // Salva per UI
        } else {
            // Logica Voto Utenti (Z-Score + Average)
            const candVotes = votes.filter(v => v.candidate_id === candidate.id);
            if (candVotes.length > 0) {
                // Calcola Z-Score medio per questo candidato su questo fattore
                const zScoresSum = candVotes.reduce((acc, v) => {
                    const rawScore = v.scores[factor.id] || 0;
                    const z = getZScore(rawScore, votesByUser[v.voter_id] || [rawScore]);
                    return acc + z;
                }, 0);
                
                // Convertiamo lo Z-Score medio in un voto 0-10 "pulito"
                // Assumiamo che Z=0 (media) sia metà scala (5/10), Z=+2 sia 10/10, Z=-2 sia 0/10
                const avgZ = zScoresSum / candVotes.length;
                // Clamp tra -2 e +2 per evitare outlier estremi, poi mappa su 0-1
                const mappedScore = Math.min(Math.max((avgZ + 2) / 4, 0), 1); 
                factorScore = mappedScore * maxScale;
                
                // Fallback: se z-score fallisce (tutti voti uguali), usa media semplice
                if (Number.isNaN(factorScore)) {
                     const simpleAvg = candVotes.reduce((a,v) => a + (v.scores[factor.id]||0), 0) / candVotes.length;
                     factorScore = simpleAvg;
                }
            }
            debugDetails[factor.name] = factorScore;
        }

        totalWeightedZScore += factorScore * factor.weight;
        totalWeights += factor.weight;
    });

    const finalScore = totalWeights > 0 ? totalWeightedZScore / totalWeights : 0;

    return {
        ...candidate,
        finalScore,
        debugDetails
    };
  });

  // D. LOGICA CONDORCET / SCHULZE (Semplificata: Pairwise Wins)
  // Chi vince più scontri diretti 1vs1?
  results.forEach(c1 => {
      let wins = 0;
      results.forEach(c2 => {
          if (c1.id !== c2.id) {
              if (c1.finalScore > c2.finalScore) wins++;
          }
      });
      (c1 as any).pairwiseWins = wins;
  });

  // Ordina per punteggio finale
  return results.sort((a, b) => b.finalScore - a.finalScore);
};