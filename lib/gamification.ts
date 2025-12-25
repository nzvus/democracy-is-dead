import { Candidate, Participant } from '@/types'

export type BadgeType = 'hater' | 'lover' | 'hive_mind' | 'maverick'

export interface UserStats {
  userId: string
  avgGiven: number // Media dei voti dati da questo utente
  deviation: number // Quanto si discosta dalla media globale
  badges: BadgeType[]
}

export function calculateBadges(
  participants: Participant[],
  votes: any[],
  results: any[] // Risultati calcolati (per sapere la media finale)
): Record<string, BadgeType[]> {
  
  const stats: Record<string, UserStats> = {}
  
  // 1. Calcola statistiche per ogni partecipante
  participants.forEach(p => {
    const userVotes = votes.filter(v => v.voter_id === p.user_id)
    if (userVotes.length === 0) return

    let totalScore = 0
    let count = 0
    let totalDiffFromAvg = 0

    userVotes.forEach(v => {
      // Per ogni candidato votato
      const candidateResult = results.find(r => r.id === v.candidate_id)
      const scores = Object.values(v.scores) as number[]
      
      if (scores.length > 0) {
        const avgVote = scores.reduce((a, b) => a + b, 0) / scores.length
        totalScore += avgVote
        count++

        // Calcola deviazione dalla media finale di quel candidato
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

  // 2. Assegna i Badge
  const statValues = Object.values(stats)
  if (statValues.length < 3) return {} // Servono almeno 3 persone per avere senso

  // Troviamo i valori estremi
  const sortedByAvg = [...statValues].sort((a, b) => a.avgGiven - b.avgGiven)
  const sortedByDev = [...statValues].sort((a, b) => a.deviation - b.deviation)

  // Hater (Voti più bassi)
  stats[sortedByAvg[0].userId].badges.push('hater')

  // Lover (Voti più alti)
  stats[sortedByAvg[sortedByAvg.length - 1].userId].badges.push('lover')

  // Hive Mind (Deviazione minima)
  stats[sortedByDev[0].userId].badges.push('hive_mind')

  // Maverick (Deviazione massima)
  stats[sortedByDev[sortedByDev.length - 1].userId].badges.push('maverick')

  // Converti in formato semplice per la UI { userId: [badges] }
  const output: Record<string, BadgeType[]> = {}
  Object.values(stats).forEach(s => {
      if (s.badges.length > 0) output[s.userId] = s.badges
  })

  return output
}

// Helper per le icone
export const getBadgeIcon = (type: BadgeType) => {
    switch(type) {
        case 'hater': return '🤬'
        case 'lover': return '😍'
        case 'hive_mind': return '🐝'
        case 'maverick': return '🦄'
    }
}