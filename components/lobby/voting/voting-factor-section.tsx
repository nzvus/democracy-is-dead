/* eslint-disable @next/next/no-img-element */
'use client'

import { Factor, Candidate } from '@/types'
import { useLanguage } from '@/components/providers/language-provider'
import Avatar from '@/components/ui/avatar'
import { Info, ChevronDown, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

  // Calcola statistiche
  const votedCount = candidates.filter(c => (votes[c.id]?.[factor.id] ?? -1) >= 0).length
  const isComplete = votedCount === candidates.length && candidates.length > 0

  const getBarColor = (val: number) => {
      const p = val / maxScale
      if (p < 0.4) return 'from-red-500 to-orange-500'
      if (p < 0.7) return 'from-yellow-500 to-amber-500'
      return 'from-emerald-500 to-green-400'
  }

  return (
    <motion.div 
        initial={false}
        animate={{ 
            backgroundColor: isActive ? 'rgba(17, 24, 39, 0.95)' : 'rgba(31, 41, 55, 0.4)',
            borderColor: isActive ? 'rgba(99, 102, 241, 0.5)' : 'rgba(75, 85, 99, 0.4)',
            scale: isActive ? 1.01 : 1,
            y: isActive ? -4 : 0
        }}
        className={`rounded-3xl border backdrop-blur-md transition-all duration-500 shadow-xl overflow-hidden`}
    >
        {/* HEADER */}
        <div onClick={onToggle} className="p-5 flex items-center justify-between cursor-pointer group hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
                {/* Icona */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-colors duration-300 ${isActive ? 'bg-indigo-600 text-white shadow-indigo-500/40' : 'bg-gray-800 text-gray-400'}`}>
                    {factor.image_url ? (
                        <img src={factor.image_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                        <span className="font-black text-2xl">{factor.name.charAt(0)}</span>
                    )}
                </div>
                
                <div>
                    <div className="flex items-center gap-3">
                        <h3 className={`font-bold text-xl ${isActive ? 'text-white' : 'text-gray-200'}`}>{factor.name}</h3>
                        {isComplete && !isActive && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-400/20">
                                <CheckCircle2 size={12} /> Completato
                            </motion.div>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium text-gray-500 mt-1">
                        <span className="bg-gray-800/80 px-2 py-0.5 rounded-md border border-gray-700/50">
                            Peso: <span className="text-gray-300 font-bold">{factor.weight}</span>
                        </span>
                        <span className={isComplete ? 'text-green-500' : 'text-gray-500'}>{votedCount}/{candidates.length} Votati</span>
                    </div>
                </div>
            </div>
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-white/5 bg-white/5 transition-transform duration-300 ${isActive ? 'rotate-180 bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : 'text-gray-500 group-hover:text-white'}`}>
                <ChevronDown size={16} />
            </div>
        </div>

        {/* BODY */}
        <AnimatePresence>
            {isActive && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="border-t border-gray-800/50"
                >
                    <div className="p-5 pt-4 space-y-8">
                        
                        {/* Info Box */}
                        <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-indigo-500/20 p-4 rounded-xl flex gap-3 items-start">
                            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
                                <Info size={18} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                                    {factor.description || "Valuta i candidati basandoti su questo criterio."}
                                </p>
                                <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-400/70">
                                    {factor.trend === 'higher_better' ? t.lobby.voting.trend_info_high : t.lobby.voting.trend_info_low}
                                </p>
                            </div>
                        </div>

                        {/* Candidates Grid */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {candidates.map(cand => {
                                const currentVal = votes[cand.id]?.[factor.id] ?? 0
                                const percentage = (currentVal / maxScale) * 100
                                
                                return (
                                    <div key={cand.id} className="bg-gray-900/60 rounded-2xl p-5 border border-gray-800 hover:border-gray-600 transition-all duration-300 relative overflow-hidden group">
                                        
                                        {/* Background Progress Bar */}
                                        <div className="absolute bottom-0 left-0 h-1.5 w-full bg-gray-800/50">
                                            <div 
                                                className={`h-full bg-gradient-to-r ${getBarColor(currentVal)} transition-all duration-500`} 
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>

                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <Avatar seed={cand.name} src={cand.image_url} className="w-12 h-12 shadow-lg ring-2 ring-black/50" />
                                                <div>
                                                    <span className="font-bold text-base text-gray-100 block">{cand.name}</span>
                                                    <span className="text-[11px] text-gray-500 truncate max-w-[140px] block">{cand.description || "Nessuna descrizione"}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="text-right">
                                                <span className={`text-3xl font-black font-mono tracking-tight transition-colors duration-300 ${currentVal > 0 ? 'text-white' : 'text-gray-700'}`}>
                                                    {currentVal}
                                                </span>
                                                <span className="text-[10px] text-gray-600 font-bold uppercase block -mt-1">su {maxScale}</span>
                                            </div>
                                        </div>

                                        {/* Slider Container */}
                                        <div className="relative h-10 flex items-center w-full z-20">
                                            <input 
                                                type="range"
                                                min={0} max={maxScale} step={step}
                                                value={currentVal}
                                                onChange={(e) => onVote(cand.id, parseFloat(e.target.value))}
                                                className="absolute w-full h-full opacity-0 cursor-pointer z-30"
                                            />
                                            
                                            {/* Visual Track */}
                                            <div className="w-full h-3 bg-gray-950 rounded-full overflow-hidden relative shadow-inner border border-gray-800/50">
                                                <div 
                                                    className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getBarColor(currentVal)} opacity-50`} 
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            
                                            {/* Thumb (Fake Visual) */}
                                            <div 
                                                className="absolute h-6 w-6 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] border-4 border-gray-900 pointer-events-none transition-all duration-75 ease-out flex items-center justify-center"
                                                style={{ left: `calc(${percentage}% - 12px)` }}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full ${currentVal > 0 ? 'bg-indigo-600' : 'bg-gray-400'}`} />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
  )
}