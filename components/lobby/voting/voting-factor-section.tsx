'use client'

import { Factor, Candidate } from '@/types'
import { useLanguage } from '@/components/providers/language-provider'
import DescriptionTooltip from '@/components/ui/description-tooltip'
import Avatar from '@/components/ui/avatar'
import { Info } from 'lucide-react'

interface VotingFactorSectionProps {
    factor: Factor
    isActive: boolean
    candidates: Candidate[]
    votes: Record<string, Record<string, number>>
    maxScale: number
    step: number
    isHost: boolean
    onToggle: () => void
    onVote: (candId: string, val: number) => void
    onStaticUpdate: (candId: string, val: number) => void 
}

export default function VotingFactorSection({ factor, isActive, candidates, votes, maxScale, step, onToggle, onVote }: VotingFactorSectionProps) {
  const { t } = useLanguage()

  // Helper per colore barra
  const getBarColor = (val: number) => {
      const p = val / maxScale
      if (p < 0.3) return 'bg-red-500'
      if (p < 0.6) return 'bg-yellow-500'
      return 'bg-green-500'
  }

  return (
    <div className={`rounded-2xl transition-all duration-300 border ${isActive ? 'bg-gray-900/80 border-indigo-500/50 shadow-2xl' : 'bg-gray-900/30 border-gray-800 hover:bg-gray-900/50'}`}>
        
        {/* HEADER */}
        <div onClick={onToggle} className="p-4 flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                    {factor.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={factor.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        <span className="font-bold text-lg">{factor.name.charAt(0)}</span>
                    )}
                </div>
                <div>
                    <h3 className={`font-bold text-lg ${isActive ? 'text-white' : 'text-gray-300'}`}>{factor.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="bg-gray-800 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">Weight: {factor.weight}</span>
                        {factor.description && <Info size={12} />}
                    </div>
                </div>
            </div>
            <div className={`transform transition-transform ${isActive ? 'rotate-180 text-indigo-400' : 'text-gray-600'}`}>▼</div>
        </div>

        {/* CONTENT */}
        {isActive && (
            <div className="p-4 pt-0 space-y-6 animate-in slide-in-from-top-2">
                {factor.description && (
                    <div className="bg-indigo-900/20 p-3 rounded-lg text-xs text-indigo-200 border border-indigo-500/20">
                        {factor.description}
                        <div className="mt-1 opacity-70 font-mono text-[10px]">
                            {factor.trend === 'higher_better' ? `↑ ${t.lobby.voting.trend_info_high}` : `↓ ${t.lobby.voting.trend_info_low}`}
                        </div>
                    </div>
                )}

                <div className="grid gap-6">
                    {candidates.map(cand => {
                        const currentVal = votes[cand.id]?.[factor.id] ?? 0
                        return (
                            <div key={cand.id} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <Avatar seed={cand.name} src={cand.image_url} className="w-6 h-6" />
                                        <span className="font-bold text-sm text-gray-300">{cand.name}</span>
                                        {cand.description && <DescriptionTooltip title={cand.name} description={cand.description}><Info size={12} className="text-gray-600" /></DescriptionTooltip>}
                                    </div>
                                    <span className="font-mono text-xl font-bold text-white">{currentVal}</span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <input 
                                        type="range"
                                        min={0} max={maxScale} step={step}
                                        value={currentVal}
                                        onChange={(e) => onVote(cand.id, parseFloat(e.target.value))}
                                        className="flex-1 h-8 accent-indigo-500 cursor-pointer"
                                    />
                                </div>
                                
                                {/* Progress Bar Visual */}
                                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-300 ${getBarColor(currentVal)}`} 
                                        style={{ width: `${(currentVal / maxScale) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )}
    </div>
  )
}