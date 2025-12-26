import { Candidate, Factor } from '@/types'


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
  
  const candStats = candidates.map(c => {
    const cVotes = votes.filter(v => v.candidate_id === c.id)
    
    
    let allNormalizedScores: number[] = []
    let factorScores: Record<string, number> = {} 

    factors.forEach(f => {
        const fVotes = cVotes.map(v => v.scores[f.id] || 0)
        
        
        const staticVal = c.static_values?.[f.id]
        if (staticVal !== undefined) fVotes.push(staticVal) 

        
        const fScoresNorm = fVotes.map(val => f.trend === 'lower_better' ? maxScale - val : val)
        
        
        const avg = fScoresNorm.length > 0 ? fScoresNorm.reduce((a,b)=>a+b,0)/fScoresNorm.length : 0
        factorScores[f.name] = avg
        
        
        fScoresNorm.forEach(s => allNormalizedScores.push(s * f.weight))
    })

    return {
        ...c,
        allScores: allNormalizedScores,
        debugDetails: factorScores, 
        finalScore: 0, 
    }
  })

  
  const weightedResults = candStats.map(c => ({
      ...c,
      finalScore: c.allScores.length > 0 ? c.allScores.reduce((a,b)=>a+b,0) / c.allScores.length : 0
  })).sort((a, b) => b.finalScore - a.finalScore)

  
  const medianResults = candStats.map(c => ({
      ...c,
      finalScore: calcMedian(c.allScores)
  })).sort((a, b) => b.finalScore - a.finalScore)

  
  const bordaPoints: Record<string, number> = {}
  candidates.forEach(c => bordaPoints[c.id] = 0)

  
  const voterIds = Array.from(new Set(votes.map(v => v.voter_id)))
  
  voterIds.forEach(vid => {
      
      const userRankings = candidates.map(c => {
          const v = votes.find(vote => vote.voter_id === vid && vote.candidate_id === c.id)
          if (!v) return { id: c.id, score: 0 }
          
          
          let s = 0;
          factors.forEach(f => {
              let val = v.scores[f.id] || 0
              if (f.trend === 'lower_better') val = maxScale - val
              s += val * f.weight
          })
          return { id: c.id, score: s }
      }).sort((a,b) => b.score - a.score) 

      
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