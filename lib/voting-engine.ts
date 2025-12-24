import { Candidate, Factor, Participant } from '@/types'

// Helper: Normalizzazione Min-Max (0-10)
const normalize = (val: number, min: number, max: number, invert: boolean, scaleMax: number) => {
  if (max === min) return scaleMax / 2 // Caso limite: tutti uguali
  let normalized = (val - min) / (max - min)
  if (invert) normalized = 1 - normalized // Inverti per "Prezzo" (Basso è meglio)
  return normalized * scaleMax
}

// Calcolo Z-Score (Standardizzazione)
// (x - media) / deviazione_standard
const calculateZScore = (value: number, allValues: number[]) => {
  if (allValues.length < 2) return 0
  const mean = allValues.reduce((a, b) => a + b, 0) / allValues.length
  const stdDev = Math.sqrt(allValues.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / allValues.length)
  if (stdDev === 0) return 0
  return (value - mean) / stdDev
}

export const calculateResults = (
  candidates: Candidate[],
  votes: any[],
  factors: Factor[],
  maxScale: number = 10
) => {
  // 1. Prepara i dati statici (Oggettivi)
  // Calcoliamo min e max per ogni fattore statico per poter normalizzare
  const staticStats: Record<string, { min: number, max: number }> = {}
  
  factors.filter(f => f.type === 'static').forEach(f => {
    const values = candidates.map(c => c.static_values?.[f.id] || 0)
    staticStats[f.id] = {
      min: Math.min(...values),
      max: Math.max(...values)
    }
  })

  // 2. Calcola Punteggi
  return candidates.map(candidate => {
    let totalWeightedScore = 0
    let totalWeights = 0
    const debugDetails: any = {}

    factors.forEach(factor => {
      let score = 0
      
      if (factor.type === 'static') {
        // LOGICA FATTORI OGGETTIVI (Prezzo, Calorie)
        const rawVal = candidate.static_values?.[factor.id] || 0
        const { min, max } = staticStats[factor.id]
        // Se "lower_better" (es. prezzo), passiamo true a invert
        score = normalize(rawVal, min, max, factor.trend === 'lower_better', maxScale)
        
      } else {
        // LOGICA FATTORI SOGGETTIVI (Voti)
        // Filtra i voti per questo candidato e fattore
        const candidateVotes = votes
          .filter(v => v.candidate_id === candidate.id)
          .map(v => v.scores[factor.id] || 0)

        if (candidateVotes.length === 0) score = 0
        else {
           // Qui potremmo usare Z-Score per "appianare" i voti severi/buoni
           // Per ora facciamo media semplice per l'MVP, ma normalizzata sul trend
           const avg = candidateVotes.reduce((a: number, b: number) => a + b, 0) / candidateVotes.length
           score = avg // La media è già in scala 0-10
           
           // Se per assurdo avessimo un voto soggettivo dove "Basso è meglio" (es. "Noia"), invertiamo
           if (factor.trend === 'lower_better') {
             score = maxScale - score
           }
        }
      }

      totalWeightedScore += score * factor.weight
      totalWeights += factor.weight
      debugDetails[factor.name] = score
    })

    const finalScore = totalWeights > 0 ? totalWeightedScore / totalWeights : 0

    return {
      ...candidate,
      finalScore, // Punteggio 0-10 (o 0-100)
      debugDetails
    }
  }).sort((a, b) => b.finalScore - a.finalScore)
}

// Calcolo Awards (Gamification)
export const calculateSocialAwards = (participants: Participant[], votes: any[], factors: Factor[]) => {
   // Implementazione futura per "Il Critico", "L'Oracolo" etc.
   return []
}