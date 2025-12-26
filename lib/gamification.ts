import { Candidate, Participant } from '@/types'

export type BadgeType = 'hater' | 'lover' | 'hive_mind' | 'maverick'

export interface UserStats {
  userId: string
  avgGiven: number 
  deviation: number 
  badges: BadgeType[]
}

export function calculateBadges(
  participants: Participant[],
  votes: any[],
  results: any[] 
): Record<string, BadgeType[]> {
  
  const stats: Record<string, UserStats> = {}
  
  
  participants.forEach(p => {
    const userVotes = votes.filter(v => v.voter_id === p.user_id)
    if (userVotes.length === 0) return

    let totalScore = 0
    let count = 0
    let totalDiffFromAvg = 0

    userVotes.forEach(v => {
      
      const candidateResult = results.find(r => r.id === v.candidate_id)
      const scores = Object.values(v.scores) as number[]
      
      if (scores.length > 0) {
        const avgVote = scores.reduce((a, b) => a + b, 0) / scores.length
        totalScore += avgVote
        count++

        
        if (candidateResult) {
            totalDiffFromAvg += Math.abs(avgVote - candidateResult.finalScore)
        }
      }
    })

    if (count > 0) {
        stats[p.user_id] = {
            userId: p.user_id,
            avgGiven: totalScore / count,
            deviation: totalDiffFromAvg / count,
            badges: []
        }
    }
  })

  
  const statValues = Object.values(stats)
  if (statValues.length < 3) return {} 

  
  const sortedByAvg = [...statValues].sort((a, b) => a.avgGiven - b.avgGiven)
  const sortedByDev = [...statValues].sort((a, b) => a.deviation - b.deviation)

  
  stats[sortedByAvg[0].userId].badges.push('hater')

  
  stats[sortedByAvg[sortedByAvg.length - 1].userId].badges.push('lover')

  
  stats[sortedByDev[0].userId].badges.push('hive_mind')

  
  stats[sortedByDev[sortedByDev.length - 1].userId].badges.push('maverick')

  
  const output: Record<string, BadgeType[]> = {}
  Object.values(stats).forEach(s => {
      if (s.badges.length > 0) output[s.userId] = s.badges
  })

  return output
}


export const getBadgeIcon = (type: BadgeType) => {
    switch(type) {
        case 'hater': return '🤬'
        case 'lover': return '😍'
        case 'hive_mind': return '🐝'
        case 'maverick': return '🦄'
    }
}