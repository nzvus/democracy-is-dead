'use client'

import { Factor } from '@/types'
import { UI } from '@/lib/constants'
import { useLanguage } from '@/components/providers/language-provider'
import { getScoreColor } from '@/lib/lobby-utils' // <--- IMPORT CONDIVISO

interface RankingTableProps {
    results: any[]
    factors: Factor[]
}

export default function RankingTable({ results, factors }: RankingTableProps) {
  const { t } = useLanguage()

  return (
    <div className={`${UI.COLORS.BG_CARD} overflow-hidden shadow-2xl ${UI.LAYOUT.ROUNDED_LG}`}>
        <div className="p-6 border-b border-gray-800 bg-gray-900/50">
            <h2 className="text-xl font-bold flex items-center gap-2">
                📊 {t.results.ranking_title}
            </h2>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-gray-950 text-[10px] md:text-xs uppercase text-gray-400 font-mono tracking-wider">
                    <tr>
                        <th className="p-4 w-10 text-center">#</th>
                        <th className="p-4 min-w-[150px]">{t.results.col_cand}</th>
                        <th className="p-4 text-right text-yellow-500 font-bold border-l border-gray-800">SCORE</th>
                        
                        {factors.map(f => (
                            <th key={f.id} className="p-4 text-center border-l border-gray-800 min-w-[100px]">
                                <div className="flex flex-col items-center gap-1">
                                    <span>{f.name}</span>
                                    <span className="text-[9px] opacity-50 font-normal normal-case">
                                        {f.type === 'static' ? (f.trend === 'lower_better' ? '↘ Low=Good' : '↗ High=Good') : t.setup.factor_type_vote}
                                    </span>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-sm">
                    {results.map((r, i) => {
                        const isWin = i === 0;
                        return (
                            <tr key={r.id} className={`group hover:bg-gray-800/30 transition-colors ${isWin ? 'bg-yellow-900/10' : ''}`}>
                                <td className="p-4 text-center font-mono text-gray-500 font-bold text-lg">{i + 1}</td>
                                
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-800 overflow-hidden shrink-0 border border-gray-700">
                                            {r.image_url && <img src={r.image_url} className="w-full h-full object-cover"/>}
                                        </div>
                                        <div>
                                            <div className="font-bold leading-tight flex items-center gap-2">
                                                {r.name}
                                                {isWin && <span>🥇</span>}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="p-4 text-right font-black text-xl font-mono text-yellow-400 border-l border-gray-800 bg-gray-900/30">
                                    {r.finalScore.toFixed(1)}
                                </td>

                                {factors.map(f => {
                                    // Punteggio normalizzato (0-10) calcolato dall'engine
                                    const normalizedScore = r.debugDetails[f.name] || 0 
                                    
                                    // Calcoliamo il colore della barra
                                    // Passiamo false perché l'engine ha già invertito i trend (quindi qui 10 è sempre verde)
                                    const barColor = getScoreColor(normalizedScore, 10, false)
                                    
                                    // Valore da mostrare (es. "150€" se statico, o "8.5" se voto)
                                    let displayValue: string | number = "-"
                                    if (f.type === 'static') {
                                        displayValue = r.static_values?.[f.id] ?? "-"
                                    } else {
                                        displayValue = normalizedScore.toFixed(1)
                                    }

                                    return (
                                        <td key={f.id} className="p-4 text-center border-l border-gray-800 relative">
                                            {/* Sfondo colorato in base alla qualità del dato */}
                                            <div 
                                                className={`absolute bottom-0 left-0 h-1 transition-all ${barColor}`} 
                                                style={{ width: `${Math.min(normalizedScore * 10, 100)}%`, opacity: 0.6 }}
                                            />
                                            <span className={`font-mono font-bold relative z-10 ${normalizedScore > 5 ? 'text-white' : 'text-gray-400'}`}>
                                                {displayValue}
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