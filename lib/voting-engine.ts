import { Candidate, Factor } from '@/types'

// Helper per calcolare la mediana
const calcMedian = (values: number[]) => {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export type VotingSystem = 'weighted' | 'borda' | 'median'

export function calculateMultiSystemResults(
  candidates: Candidate[],
  votes: any[],
  factors: Factor[],
  maxScale: number
) {
  // 1. Struttura dati base
  const candStats = candidates.map(c => {
    const cVotes = votes.filter(v => v.candidate_id === c.id)
    
    // Raccogliamo tutti i punteggi normalizzati per questo candidato
    let allNormalizedScores: number[] = []
    let factorScores: Record<string, number> = {} 

    factors.forEach(f => {
        const fVotes = cVotes.map(v => v.scores[f.id] || 0)
        
        // Gestione static values (se presenti)
        const staticVal = c.static_values?.[f.id]
        if (staticVal !== undefined) fVotes.push(staticVal) 

        // Normalizzazione (se LowerBetter invertiamo)
        const fScoresNorm = fVotes.map(val => f.trend === 'lower_better' ? maxScale - val : val)
        
        // Media per fattore (per il Radar)
        const avg = fScoresNorm.length > 0 ? fScoresNorm.reduce((a,b)=>a+b,0)/fScoresNorm.length : 0
        factorScores[f.name] = avg
        
        // Accumuliamo per i calcoli globali (pesati)
        fScoresNorm.forEach(s => allNormalizedScores.push(s * f.weight))
    })

    return {
        ...c,
        allScores: allNormalizedScores,
        debugDetails: factorScores, // <--- FIX: Rinominiamo/Aliasiamo per compatibilità con i grafici
        finalScore: 0, 
    }
  })

  // --- CALCOLO SISTEMA 1: MEDIA PONDERATA (Weighted) ---
  const weightedResults = candStats.map(c => ({
      ...c,
      finalScore: c.allScores.length > 0 ? c.allScores.reduce((a,b)=>a+b,0) / c.allScores.length : 0
  })).sort((a, b) => b.finalScore - a.finalScore)

  // --- CALCOLO SISTEMA 2: MEDIANA (Median) ---
  const medianResults = candStats.map(c => ({
      ...c,
      finalScore: calcMedian(c.allScores)
  })).sort((a, b) => b.finalScore - a.finalScore)

  // --- CALCOLO SISTEMA 3: BORDA COUNT ---
  const bordaPoints: Record<string, number> = {}
  candidates.forEach(c => bordaPoints[c.id] = 0)

  // Simuliamo le schede elettorali per ogni votante
  const voterIds = Array.from(new Set(votes.map(v => v.voter_id)))
  
  voterIds.forEach(vid => {
      // Classifica personale dell'utente
      const userRankings = candidates.map(c => {
          const v = votes.find(vote => vote.voter_id === vid && vote.candidate_id === c.id)
          if (!v) return { id: c.id, score: 0 }
          
          // Calcola score grezzo pesato per l'ordinamento personale
          let s = 0;
          factors.forEach(f => {
              let val = v.scores[f.id] || 0
              if (f.trend === 'lower_better') val = maxScale - val
              s += val * f.weight
          })
          return { id: c.id, score: s }
      }).sort((a,b) => b.score - a.score) 

      // Assegna punti Borda: 1° = N punti, Ultimo = 1 punto
      userRankings.forEach((item, index) => {
          const points = candidates.length - index
          bordaPoints[item.id] += points
      })
  })

  const bordaResults = candStats.map(c => ({
      ...c,
      finalScore: bordaPoints[c.id] || 0
  })).sort((a, b) => b.finalScore - a.finalScore)

  return {
      weighted: weightedResults,
      borda: bordaResults,
      median: medianResults
  }
}