'use client'
import { useLanguage } from '@/components/providers/language-provider'
import { UI } from '@/lib/constants'
import { Candidate, Participant } from '@/types'
import { BadgeType, getBadgeIcon } from '@/lib/gamification'
import DescriptionTooltip from '@/components/ui/description-tooltip'

interface ResultsMatrixProps {
  candidates: Candidate[]; participants: Participant[]; votes: any[]; currentUserId: string; isAnonymous?: boolean; badges?: Record<string, BadgeType[]>
}

export default function ResultsMatrix({ candidates, participants, votes, currentUserId, isAnonymous = false, badges = {} }: ResultsMatrixProps) {
  const { t } = useLanguage()

  if (isAnonymous) return <div className="p-8 border border-dashed border-gray-700 rounded-xl text-center bg-gray-900/30"><h3 className="font-bold text-gray-300">{t.results.matrix_anon}</h3></div>

  const getUserScore = (userId: string, candId: string) => {
      const voteRecord = votes.find(v => v.voter_id === userId && v.candidate_id === candId)
      if (!voteRecord || !voteRecord.scores) return "-"
      const scores = Object.values(voteRecord.scores) as number[]
      if (scores.length === 0) return "-"
      return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
  }

  return (
    <div className={`${UI.COLORS.BG_CARD} border-y md:border md:rounded-lg border-gray-800 overflow-hidden shadow-xl`}>
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[350px]">
                <thead>
                    <tr>
                        {/* Header Partecipanti */}
                        <th className="p-2 md:p-3 bg-gray-950/50 sticky left-0 z-10 border-b border-gray-800 min-w-[130px] md:min-w-[180px]"></th>
                        
                        {/* Header Candidati */}
                        {candidates.map(c => (
                            <th key={c.id} className="p-2 border-b border-l border-gray-800 text-center min-w-[60px] md:min-w-[100px]">
                                <div className="flex flex-col items-center gap-1">
                                    <DescriptionTooltip title={c.name} description={c.description}>
                                        <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-gray-800 overflow-hidden border border-gray-700 cursor-help hover:border-yellow-500 transition-colors">
                                            {c.image_url ? <img src={c.image_url} className="w-full h-full object-cover"/> : <span className="flex items-center justify-center h-full text-xs">👤</span>}
                                        </div>
                                    </DescriptionTooltip>
                                    <span className="text-[9px] md:text-[10px] uppercase font-bold text-gray-400 truncate w-16 md:w-24 block">{c.name}</span>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-xs">
                    {participants.map(p => {
                        const isMe = p.user_id === currentUserId
                        const userBadges = badges[p.user_id] || [] // Recupera badge utente
                        
                        return (
                            <tr key={p.id} className={`hover:bg-gray-800/30 transition-colors ${isMe ? 'bg-indigo-900/10' : ''}`}>
                                
                                {/* Colonna Partecipante */}
                                <td className="p-2 md:p-3 sticky left-0 z-10 bg-gray-900 border-r border-gray-800 shadow-[2px_0_10px_rgba(0,0,0,0.2)]">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-800 overflow-hidden shrink-0 border border-gray-700">
                                             {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover"/> : <span className="flex items-center justify-center h-full text-xs">👤</span>}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className={`text-xs md:text-sm font-bold truncate max-w-[80px] md:max-w-none ${isMe ? 'text-indigo-400' : 'text-gray-200'}`}>{p.nickname}</span>
                                                
                                                {/* BADGES SECTION */}
                                                {userBadges.map(b => (
                                                    <DescriptionTooltip 
                                                        key={b} 
                                                        title={t.results.badges[b]} 
                                                        description={t.results.badges_desc[b]}
                                                    >
                                                        <span className="cursor-help hover:scale-125 transition-transform inline-block text-base select-none">
                                                            {getBadgeIcon(b)}
                                                        </span>
                                                    </DescriptionTooltip>
                                                ))}

                                            </div>
                                            {isMe && <span className="text-[8px] text-indigo-500/70 font-mono uppercase tracking-wider font-bold">{t.results.my_vote}</span>}
                                        </div>
                                    </div>
                                </td>

                                {/* Voti */}
                                {candidates.map(c => {
                                    const score = getUserScore(p.user_id, c.id)
                                    const num = parseFloat(score)
                                    let color = "text-gray-500"
                                    if (!isNaN(num)) color = num >= 8 ? "text-green-400 font-bold" : num <= 4 ? "text-red-400" : "text-yellow-500"
                                    return (
                                        <td key={`${p.id}-${c.id}`} className="p-2 text-center border-l border-gray-800/50">
                                            <span className={`font-mono text-xs md:text-sm ${color}`}>{score}</span>
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