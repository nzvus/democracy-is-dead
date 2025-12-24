'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { calculateResults } from '@/lib/voting-engine' // Ti darò questo file nel prossimo step
import { useLanguage } from '@/components/providers/language-provider'
import { Factor, Candidate } from '@/types'
import { UI } from '@/lib/constants'

export default function LobbyResults({ lobby }: { lobby: any }) {
  const { t } = useLanguage()
  const supabase = createClient()
  
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const factors: Factor[] = lobby.settings.factors || []

  useEffect(() => {
    const calculate = async () => {
      // 1. Scarica TUTTI i dati necessari
      const { data: candidates } = await supabase.from('candidates').select('*').eq('lobby_id', lobby.id)
      const { data: votes } = await supabase.from('votes').select('*').eq('lobby_id', lobby.id)
      
      if (!candidates || !votes || candidates.length === 0) {
          setLoading(false)
          return
      }

      // 2. Calcola con il motore avanzato (Z-Score + Normalizzazione)
      const calculated = calculateResults(
          candidates, 
          votes, 
          factors, 
          lobby.settings.voting_scale?.max || 10
      )

      setResults(calculated)
      setLoading(false)
    }

    calculate()
  }, [lobby, supabase])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className={`animate-spin text-4xl text-${UI.COLORS.PRIMARY}-500`}>⏳</div>
    </div>
  )

  if (results.length === 0) return <div className="text-white text-center p-10">{t.common.error}</div>

  const winner = results[0]

  return (
    <div className={`min-h-screen bg-gray-950 text-white ${UI.LAYOUT.PADDING_X} pb-32 pt-10`}>
      
      <div className={`w-full max-w-4xl mx-auto space-y-12 animate-in fade-in`}>
        
        {/* 1. HEADER VINCITORE */}
        <div className="text-center space-y-6">
            <div className="inline-block relative group cursor-pointer">
                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-yellow-500 shadow-[0_0_80px_rgba(234,179,8,0.3)] overflow-hidden mx-auto bg-gray-800 transition-transform group-hover:scale-105">
                    {winner.image_url ? (
                        <img src={winner.image_url} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">🏆</div>
                    )}
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black font-black px-6 py-2 rounded-full uppercase tracking-widest text-sm shadow-lg whitespace-nowrap">
                    {t.results.winner_title}
                </div>
            </div>
            
            <div>
                <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-600">
                    {winner.name}
                </h1>
                <p className="text-gray-400 mt-2 font-mono text-xl">
                    Score: <span className="text-yellow-400 font-bold">{winner.finalScore.toFixed(2)}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{t.results.winner_subtitle}</p>
            </div>
        </div>

        {/* 2. TABELLA ANALITICA DETTAGLIATA */}
        <div className={`${UI.COLORS.BG_CARD} overflow-hidden shadow-2xl ${UI.LAYOUT.ROUNDED_LG}`}>
            <div className="p-6 border-b border-gray-800 bg-gray-900/50">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    📊 {t.results.ranking_title}
                </h2>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-950 text-[10px] md:text-xs uppercase text-gray-400 font-mono tracking-wider">
                        <tr>
                            <th className="p-4 w-10 text-center">#</th>
                            <th className="p-4 min-w-[150px]">{t.results.col_cand}</th>
                            <th className="p-4 text-right text-yellow-500 font-bold border-l border-gray-800">SCORE</th>
                            
                            {/* Colonne dinamiche per ogni fattore */}
                            {factors.map(f => (
                                <th key={f.id} className="p-4 text-center border-l border-gray-800 min-w-[100px]">
                                    <div className="flex flex-col items-center gap-1">
                                        {f.image_url && <img src={f.image_url} className="w-6 h-6 rounded object-cover mb-1"/>}
                                        <span>{f.name}</span>
                                        <span className="text-[9px] opacity-50 font-normal normal-case">
                                            {f.type === 'static' ? (f.trend === 'lower_better' ? '↘ Low=Good' : '↗ High=Good') : 'User Vote'}
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

                                    {/* Celle Dati Dinamici */}
                                    {factors.map(f => {
                                        // Recuperiamo il valore grezzo (es. prezzo) e il punteggio normalizzato (0-10)
                                        const normalizedScore = r.debugDetails[f.name] || 0 
                                        let displayValue: string | number = "-"

                                        if (f.type === 'static') {
                                            displayValue = r.static_values?.[f.id] ?? "-"
                                        } else {
                                            displayValue = normalizedScore.toFixed(1)
                                        }

                                        // Colore basato sulla bontà del dato (normalizedScore alto = verde)
                                        const isGood = normalizedScore > 6
                                        const isBad = normalizedScore < 4

                                        return (
                                            <td key={f.id} className="p-4 text-center border-l border-gray-800 relative">
                                                {/* Barra di sfondo per qualità */}
                                                <div 
                                                    className={`absolute bottom-0 left-0 h-0.5 transition-all ${isGood ? 'bg-green-500' : (isBad ? 'bg-red-500' : 'bg-yellow-500')}`} 
                                                    style={{ width: `${Math.min(normalizedScore * 10, 100)}%`, opacity: 0.5 }}
                                                />
                                                
                                                <span className={`font-mono font-bold ${isGood ? 'text-white' : 'text-gray-500'}`}>
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

        {/* 3. LEGENDA MATEMATICA */}
        <div className="bg-black/30 p-6 rounded-2xl border border-gray-800 text-xs text-gray-500 leading-relaxed">
            <h3 className="font-bold text-gray-300 mb-2">{t.results.math_legend_title}</h3>
            <p>{t.results.math_legend_desc}</p>
        </div>

      </div>
    </div>
  )
}