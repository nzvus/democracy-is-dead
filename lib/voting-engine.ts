import { Candidate, Factor } from '@/types'

// ==========================================
// 1. UTILS MATEMATICI (Z-Score & Scaling)
// ==========================================

const calculateMean = (values: number[]) => {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
};

const calculateStdDev = (values: number[], mean: number) => {
  if (values.length < 2) return 0;
  const squareDiffs = values.map(value => Math.pow(value - mean, 2));
  return Math.sqrt(calculateMean(squareDiffs));
};

// Z-Score: (x - media) / deviazione_standard
// Indica quante deviazioni standard un voto si discosta dalla media del votante
const getZScore = (value: number, allUserVotes: number[]) => {
    if (allUserVotes.length < 2) return 0; 
    const mean = calculateMean(allUserVotes);
    const stdDev = calculateStdDev(allUserVotes, mean);
    if (stdDev === 0) return 0;
    return (value - mean) / stdDev;
};

// Normalizzazione Min-Max (per fattori statici come Prezzo)
// Output: 0.0 - 1.0
const normalizeMinMax = (val: number, min: number, max: number, invert: boolean) => {
    if (max === min) return 0.5; // Se tutti uguali, punteggio medio
    let norm = (val - min) / (max - min);
    if (invert) norm = 1 - norm; // Inverti per "Prezzo" (Basso è meglio)
    return Math.max(0, Math.min(1, norm)); // Clamp 0-1
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
  
  // A. PREPARAZIONE DATI STATICI (Min/Max globali per normalizzare)
  const staticStats: Record<string, { min: number, max: number }> = {};
  
  factors.filter(f => f.type === 'static').forEach(f => {
    // Raccogli tutti i valori inseriti per questo fattore
    const values = candidates.map(c => c.static_values?.[f.id] ?? 0);
    // Trova estremi ignorando eventuali valori nulli/zero se necessario, qui semplifichiamo
    staticStats[f.id] = { 
        min: Math.min(...values), 
        max: Math.max(...values) 
    };
  });

  // B. PREPARAZIONE VOTI UTENTI (Z-SCORE)
  // Raggruppa voti per utente per calcolare la loro "severità" media
  const votesByUser: Record<string, number[]> = {};
  votes.forEach(v => {
     Object.values(v.scores).forEach((score: any) => {
         if(!votesByUser[v.voter_id]) votesByUser[v.voter_id] = [];
         votesByUser[v.voter_id].push(Number(score));
     });
  });

  // C. CALCOLO PUNTEGGI PER OGNI CANDIDATO
  const results = candidates.map(candidate => {
    let totalWeightedScore = 0;
    let totalWeights = 0;
    
    // Debug info per mostrare i dettagli nella tabella UI
    const debugDetails: any = {};

    factors.forEach(factor => {
        let factorScore = 0; // Sarà in scala 0 - maxScale

        if (factor.type === 'static') {
            // --- LOGICA DATI OGGETTIVI ---
            const raw = candidate.static_values?.[factor.id] ?? 0;
            const { min, max } = staticStats[factor.id] || { min: 0, max: 1 };
            
            // Normalizza 0-1 considerando se "Basso è meglio"
            const normalized = normalizeMinMax(raw, min, max, factor.trend === 'lower_better');
            factorScore = normalized * maxScale; 
            
            // Salviamo il punteggio calcolato per il debug, ma l'UI mostrerà il valore raw
            debugDetails[factor.name] = factorScore; 

        } else {
            // --- LOGICA VOTO SOGGETTIVO (Z-Score) ---
            const candVotes = votes.filter(v => v.candidate_id === candidate.id);
            
            if (candVotes.length > 0) {
                // Calcola somma Z-Score per questo candidato su questo fattore
                let zScoreSum = 0;
                let rawSum = 0;

                candVotes.forEach(v => {
                    const rawScore = v.scores[factor.id] || 0;
                    rawSum += rawScore;
                    // Calcola Z-Score rispetto alla storia di QUESTO votante
                    zScoreSum += getZScore(rawScore, votesByUser[v.voter_id] || [rawScore]);
                });
                
                // Media Z-Score
                const avgZ = zScoreSum / candVotes.length;
                
                // MAPPING Z-SCORE SU SCALA 0-Max
                // Assumiamo: Z=0 (media) -> 50%, Z=+2 -> 100%, Z=-2 -> 0%
                // Questo "appiattisce" le differenze di severità tra giudici
                let mappedScore = (avgZ + 2) / 4; 
                mappedScore = Math.max(0, Math.min(1, mappedScore)); // Clamp 0-1

                // Se non ci sono abbastanza dati per Z-Score (deviazione 0), usa media aritmetica semplice
                // Fallback anche se Z-Score produce NaN
                if (Number.isNaN(mappedScore) || candVotes.length < 3) {
                     factorScore = (rawSum / candVotes.length);
                } else {
                     factorScore = mappedScore * maxScale;
                }

                // Gestione Trend inverso sui voti soggettivi (raro ma possibile)
                if (factor.trend === 'lower_better') {
                    factorScore = maxScale - factorScore;
                }
            }
            debugDetails[factor.name] = factorScore;
        }

        totalWeightedScore += factorScore * factor.weight;
        totalWeights += factor.weight;
    });

    const finalScore = totalWeights > 0 ? totalWeightedScore / totalWeights : 0;

    return {
        ...candidate,
        finalScore, // Punteggio 0-maxScale
        debugDetails
    };
  });

  // D. LOGICA CONDORCET (Pairwise Wins) - Richiesto dai PDF
  // Conta quanti "scontri diretti 1vs1" vince ogni candidato
  results.forEach(c1 => {
      let wins = 0;
      results.forEach(c2 => {
          if (c1.id !== c2.id) {
              // Se c1 ha un punteggio aggregato migliore di c2, vince lo scontro
              // (In una implementazione Schulze pura, si confronterebbero le preferenze di ogni singolo votante,
              // qui usiamo il punteggio finale pesato come proxy per l'MVP)
              if (c1.finalScore > c2.finalScore) wins++;
          }
      });
      (c1 as any).pairwiseWins = wins;
  });

  // Ordina per punteggio finale decrescente
  return results.sort((a, b) => b.finalScore - a.finalScore);
};