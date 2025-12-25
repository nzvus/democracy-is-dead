'use client'

import { useLanguage } from '@/components/providers/language-provider'
import { UI } from '@/lib/constants'
import { Candidate, Participant } from '@/types'
import { BadgeType, getBadgeIcon } from '@/lib/gamification'

interface ResultsMatrixProps {
  candidates: Candidate[]
  participants: Participant[]
  votes: any[]
  currentUserId: string
  isAnonymous?: boolean
  badges?: Record<string, BadgeType[]>
}

export default function ResultsMatrix({ 
  candidates, 
  participants, 
  votes, 
  currentUserId,
  isAnonymous = false,
  badges = {}
}: ResultsMatrixProps) {
  const { t } = useLanguage()

  if (isAnonymous) {
      return (
          <div className="p-8 border border-dashed border-gray-700 rounded-xl text-center bg-gray-900/30">
              <div className="text-4xl mb-2">🕵️</div>
              <h3 className="font-bold text-gray-300">{t.results.matrix_anon}</h3>
              <p className="text-gray-500 text-sm">{t.results.matrix_anon_desc}</p>
          </div>
      )
  }

  // Helper: Calcola la media dei voti dati da Utente X a Candidato Y
  const getUserScore = (userId: string, candId: string) => {
      const voteRecord = votes.find(v => v.voter_id === userId && v.candidate_id === candId)
      if (!voteRecord || !voteRecord.scores) return "-"

      const scores = Object.values(voteRecord.scores) as number[]
      if (scores.length === 0) return "-"
      
      const sum = scores.reduce((a, b) => a + b, 0)
      return (sum / scores.length).toFixed(1)
  }

  return (
    <div className={`${UI.COLORS.BG_CARD} border border-gray-800 ${UI.LAYOUT.ROUNDED_LG} overflow-hidden shadow-xl`}>
        <div className="p-6 border-b border-gray-800 bg-gray-900/50">
            <h2 className="text-xl font-bold flex items-center gap-2">
                🔍 {t.results.matrix_title}
            </h2>
            <p className="text-xs text-gray-500">{t.results.matrix_subtitle}</p>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[600px]">
                {/* HEADER: Candidati */}
                <thead>
                    <tr>
                        <th className="p-4 bg-gray-950/50 sticky left-0 z-10 border-b border-gray-800 min-w-[180px]">
                            {/* Angolo Vuoto */}
                        </th>
                        {candidates.map(c => (
                            <th key={c.id} className="p-3 border-b border-l border-gray-800 text-center min-w-[100px]">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 rounded bg-gray-800 overflow-hidden border border-gray-700">
                                        {c.image_url ? <img src={c.image_url} className="w-full h-full object-cover"/> : <span className="flex items-center justify-center h-full text-xs">👤</span>}
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 truncate w-24 block">
                                        {c.name}
                                    </span>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* BODY: Partecipanti */}
                <tbody className="divide-y divide-gray-800">
                    {participants.map(p => {
                        const isMe = p.user_id === currentUserId
                        const userBadges = badges[p.user_id] || []

                        return (
                            <tr key={p.id} className={`hover:bg-gray-800/30 transition-colors ${isMe ? 'bg-indigo-900/10' : ''}`}>
                                
                                {/* Cella Nome + Badges */}
                                <td className="p-3 sticky left-0 z-10 bg-gray-900 border-r border-gray-800 shadow-[2px_0_10px_rgba(0,0,0,0.2)]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden shrink-0 border border-gray-700">
                                             {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover"/> : <span className="flex items-center justify-center h-full text-xs">👤</span>}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-sm font-bold truncate ${isMe ? 'text-indigo-400' : 'text-gray-200'}`}>
                                                    {p.nickname}
                                                </span>
                                                {/* BADGES ICONS */}
                                                {userBadges.map(b => (
                                                    <div 
                                                        key={b} 
                                                        className="group relative cursor-help"
                                                    >
                                                        <span className="text-sm hover:scale-125 transition-transform inline-block">
                                                            {getBadgeIcon(b)}
                                                        </span>
                                                        {/* Tooltip Badge */}
                                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50 border border-gray-700 shadow-xl">
                                                            <span className="font-bold text-yellow-500 block">{t.results.badges[b]}</span>
                                                            <span className="opacity-75">{t.results.badges_desc[b]}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {isMe && <span className="text-[9px] text-indigo-500/70 font-mono uppercase tracking-wider font-bold">{t.results.my_vote}</span>}
                                        </div>
                                    </div>
                                </td>

                                {/* Celle Voti */}
                                {candidates.map(c => {
                                    const score = getUserScore(p.user_id, c.id)
                                    const numScore = parseFloat(score)
                                    
                                    // Color Coding Semplice
                                    let colorClass = "text-gray-500"
                                    if (!isNaN(numScore)) {
                                        if (numScore >= 8) colorClass = "text-green-400 font-black"
                                        else if (numScore <= 4) colorClass = "text-red-400"
                                        else colorClass = "text-yellow-500 font-bold"
                                    }

                                    return (
                                        <td key={`${p.id}-${c.id}`} className="p-3 text-center border-l border-gray-800/50">
                                            <span className={`font-mono text-sm ${colorClass}`}>
                                                {score}
                                            </span>
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    </div>
  )
}