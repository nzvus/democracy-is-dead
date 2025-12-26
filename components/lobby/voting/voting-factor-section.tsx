'use client'

import { UI } from '@/lib/constants'
import { Factor, Candidate } from '@/types'
import { useLanguage } from '@/components/providers/language-provider'
import { getScoreColor } from '@/lib/lobby-utils'
import DescriptionTooltip from '@/components/ui/description-tooltip'

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

export default function VotingFactorSection({
  factor,
  isActive,
  candidates,
  votes,
  maxScale,
  step,
  isHost,
  onToggle,
  onVote,
  onStaticUpdate
}: VotingFactorSectionProps) {
  const { t } = useLanguage()
  const isLowerBetter = factor.trend === 'lower_better'
  const isStatic = factor.type === 'static'

  const borderColor = isActive 
      ? (isLowerBetter ? 'border-amber-500/50' : `border-${UI.COLORS.PRIMARY}-500/50`) 
      : 'border-gray-800'
  
  const bgStyle = isActive
      ? (isLowerBetter ? 'bg-amber-950/10' : 'bg-indigo-950/10')
      : 'bg-gray-900/40'

  return (
    <div className={`border ${UI.LAYOUT.ROUNDED_LG} overflow-hidden transition-all duration-300 ${borderColor} ${bgStyle}`}>
        
        {/* HEADER (Clickable) */}
        <div className="p-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-left w-full">
                    
                    {/* TOOLTIP SULL'ICONA DEL FATTORE */}
                    <DescriptionTooltip title={factor.name} description={factor.description}>
                        <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden shrink-0 cursor-help hover:border-white transition-colors relative z-20 shadow-lg">
                            {factor.image_url ? <img src={factor.image_url} className="w-full h-full object-cover" /> : <span className="text-xl">📊</span>}
                        </div>
                    </DescriptionTooltip>

                    {/* Area cliccabile per espandere (il resto della riga) */}
                    <button onClick={onToggle} className="flex-1 flex items-center justify-between outline-none text-left pl-2">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xl font-black">{factor.name}</span>
                                {isLowerBetter ? (
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono uppercase tracking-wider ${UI.COLORS.TREND_LOW}`}>↘ LOW</span>
                                ) : (
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono uppercase tracking-wider ${UI.COLORS.TREND_HIGH}`}>↗ HIGH</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mt-1">
                                <span>x{factor.weight}</span>
                                {isStatic && <span className="text-amber-500"> • {t.setup.factor_type_static}</span>}
                            </div>
                        </div>
                        <div className={`text-xl transition-transform ${isActive ? 'rotate-180' : ''}`}>▼</div>
                    </button>
                </div>
            </div>
            
            {/* INFO TREND */}
            {isActive && (
                <div className="mt-2 pl-[4rem]">
                    <div className="text-[10px] text-gray-400 italic">
                        {isLowerBetter ? t.lobby.voting.trend_info_low : t.lobby.voting.trend_info_high}
                    </div>
                </div>
            )}
        </div>

        {/* BODY (Candidates List) */}
        {isActive && (
            <div className="px-5 pb-8 space-y-8 border-t border-gray-800/50 pt-6 animate-in slide-in-from-top-2">
                {candidates.map((candidate) => {
                    const score = votes[candidate.id]?.[factor.id] || 0
                    const staticVal = candidate.static_values?.[factor.id] ?? 0
                    const barColor = getScoreColor(score, maxScale, isLowerBetter)

                    return (
                        <div key={candidate.id} className="group">
                            <div className="flex justify-between items-end mb-4">
                                {/* INFO CANDIDATO (TOOLTIP) */}
                                <div className="flex items-center gap-3">
                                    <DescriptionTooltip title={candidate.name} description={candidate.description}>
                                        <div className="w-10 h-10 rounded-lg bg-gray-800 overflow-hidden shrink-0 border border-gray-700 relative group-hover:ring-2 ring-indigo-500 cursor-help transition-all">
                                            {candidate.image_url ? <img src={candidate.image_url} className="w-full h-full object-cover"/> : <span className="flex items-center justify-center h-full">👤</span>}
                                        </div>
                                    </DescriptionTooltip>
                                    <span className="font-bold text-lg leading-none">{candidate.name}</span>
                                </div>
                                
                                {!isStatic && (
                                    <div className={`w-12 h-10 flex items-center justify-center rounded-lg text-lg font-bold font-mono transition-colors text-white ${barColor}`}>
                                        {score}
                                    </div>
                                )}
                            </div>

                            {/* INPUTS */}
                            {isStatic ? (
                                <div className="bg-black/20 p-3 rounded-xl border border-gray-800 flex items-center justify-between">
                                    <span className="text-xs text-gray-500 font-bold uppercase">{t.lobby.voting.static_value_label}</span>
                                    {isHost ? (
                                        <input 
                                            type="number" 
                                            value={staticVal}
                                            onChange={(e) => onStaticUpdate(candidate.id, Number(e.target.value))}
                                            className="w-24 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-right font-mono font-bold focus:border-indigo-500 outline-none transition-all"
                                        />
                                    ) : (
                                        <span className="font-mono font-bold text-lg">{staticVal}</span>
                                    )}
                                </div>
                            ) : (
                                <div className="relative">
                                    <input 
                                        type="range" min="0" max={maxScale} step={step} value={score}
                                        onChange={(e) => onVote(candidate.id, Number(e.target.value))}
                                        className={`w-full h-10 bg-gray-800 rounded-xl appearance-none cursor-pointer touch-none shadow-inner accent-${isLowerBetter ? 'amber' : 'indigo'}-500`}
                                    />
                                    <div className="flex justify-between px-1 mt-1 text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                                        <span>0</span><span>{maxScale}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        )}
    </div>
  )
}