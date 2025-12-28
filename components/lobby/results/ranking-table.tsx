'use client'

import { Candidate } from '@/types'
import Avatar from '@/components/ui/avatar'
import { Trophy, Medal } from 'lucide-react'
import DescriptionTooltip from '@/components/ui/description-tooltip'

interface RankingTableProps {
  results: Candidate[]
  scores: Record<string, number>
  system: 'weighted' | 'borda' | 'schulze'
}

export default function RankingTable({ results, scores, system }: RankingTableProps) {
  
  const formatScore = (val: number) => {
      if (val === undefined) return "-"
      if (system === 'weighted') return val.toFixed(2)
      if (system === 'borda') return Math.round(val) + " pts"
      if (system === 'schulze') return val + " wins"
      return val
  }

  return (
    <div className="w-full bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
        {results.map((candidate, index) => {
            const isWinner = index === 0
            const score = scores[candidate.id] || 0

            return (
                <div 
                    key={candidate.id} 
                    className={`flex items-center gap-4 p-4 border-b border-gray-800 last:border-0 transition-colors ${isWinner ? 'bg-yellow-500/10' : 'hover:bg-white/5'}`}
                >
                    <div className="w-8 flex justify-center font-black text-lg">
                        {index === 0 ? <Trophy className="text-yellow-500" size={24} /> : 
                         index === 1 ? <Medal className="text-gray-400" size={20} /> :
                         index === 2 ? <Medal className="text-orange-700" size={20} /> :
                         <span className="text-gray-600">#{index + 1}</span>}
                    </div>

                    {}
                    <Avatar seed={candidate.name} src={candidate.image_url} className="w-10 h-10 md:w-12 md:h-12 shadow-lg" />
                    
                    <div className="flex-1 min-w-0">
                        {}
                        <DescriptionTooltip title={candidate.name} description={candidate.description}>
                            <h4 className={`font-bold truncate cursor-help ${isWinner ? 'text-yellow-500' : 'text-gray-200'}`}>
                                {candidate.name}
                            </h4>
                        </DescriptionTooltip>
                    </div>

                    <div className="text-right">
                        <span className="block font-mono font-bold text-lg md:text-xl text-white">
                            {formatScore(score)}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-gray-600">
                            {system === 'borda' ? 'Points' : 'Score'}
                        </span>
                    </div>
                </div>
            )
        })}
    </div>
  )
} 