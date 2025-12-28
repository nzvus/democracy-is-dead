'use client'

import { Candidate, Participant } from '@/types'
import { useLanguage } from '@/components/providers/language-provider'
import Avatar from '@/components/ui/avatar'
import DescriptionTooltip from '@/components/ui/description-tooltip' 
import { BadgeType, getBadgeIcon } from '@/core/gamification/awards'
import { VoteRecord } from '@/core/voting/types'

interface ResultsMatrixProps {
  candidates: Candidate[]
  participants: Participant[]
  votes: VoteRecord[] 
  currentUserId: string
  badges: Record<string, BadgeType[]>
}

export default function ResultsMatrix({ candidates, participants, votes, currentUserId, badges }: ResultsMatrixProps) {
  const { t } = useLanguage()

  const activeParticipants = participants.filter(p => p.has_voted)

  return (
    <div className="w-full overflow-x-auto bg-gray-900/50 rounded-xl border border-gray-800">
      <table className="w-full text-xs md:text-sm">
        <thead>
          <tr>
            <th className="p-3 bg-gray-900/80 sticky left-0 z-10 min-w-[140px] text-left">
               <span className="text-gray-500 font-normal">{t.results.matrix_anon}</span>
            </th>
            {candidates.map(c => (
              <th key={c.id} className="p-3 min-w-[80px] text-center font-normal text-gray-500">
                 <div className="flex flex-col items-center gap-1">
                     <Avatar seed={c.name} className="w-6 h-6 opacity-70" />
                     <span className="truncate max-w-[80px]">{c.name}</span>
                 </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activeParticipants.map((p) => {
             const isMe = p.user_id === currentUserId
             const userBadges = badges[p.user_id] || []

             return (
               <tr key={p.id} className={`border-t border-gray-800 ${isMe ? 'bg-indigo-900/10' : ''}`}>
                 <td className="p-3 bg-gray-900/80 sticky left-0 z-10 font-bold text-gray-300 flex flex-col justify-center min-w-[140px]">
                    <div className="flex items-center gap-2">
                        <Avatar seed={p.nickname || "Anon"} className="w-6 h-6" />
                        <span className={isMe ? 'text-indigo-400' : ''}>
                            {p.nickname || t.results.matrix_anon} {isMe && t.results.my_vote}
                        </span>
                    </div>
                    {userBadges.length > 0 && (
                        <div className="flex gap-1 mt-1 ml-8">
                            {userBadges.map(b => (
                                <DescriptionTooltip 
                                    key={b} 
                                    title={t.results.badges[b]}
                                    description={t.results.badges_desc[b]}
                                >
                                    <span className="text-sm cursor-help">{getBadgeIcon(b)}</span>
                                </DescriptionTooltip>
                            ))}
                        </div>
                    )}
                 </td>

                 {candidates.map(c => {
                    const vote = votes.find(v => v.voter_id === p.user_id && v.candidate_id === c.id)
                    let avg = 0
                    if (vote && vote.scores) {
                        const vals = Object.values(vote.scores) as number[]
                        if (vals.length > 0) avg = vals.reduce((a,b)=>a+b,0) / vals.length
                    }
                    
                    return (
                        <td key={c.id} className="p-3 text-center border-l border-gray-800/50">
                            {vote ? (
                                <span className={`font-mono font-bold ${avg >= 8 ? 'text-green-400' : avg <= 4 ? 'text-red-400' : 'text-gray-400'}`}>
                                    {avg.toFixed(1)}
                                    {vote.is_jolly && <span className="ml-1 text-yellow-500">★</span>}
                                </span>
                            ) : (
                                <span className="text-gray-700">-</span>
                            )}
                        </td>
                    )
                 })}
               </tr>
             )
          })}
        </tbody>
      </table>
    </div>
  )
} 