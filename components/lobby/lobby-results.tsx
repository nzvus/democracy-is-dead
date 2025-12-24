'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { calculateSchulze, calculateAverage, calculateSocialAwards } from '@/utils/voting-engine'
import { useLanguage } from '@/components/providers/language-provider'

export default function LobbyResults({ lobby }: { lobby: any }) {
  const { t } = useLanguage()
  const supabase = createClient()
  
  const [schulzeResults, setSchulzeResults] = useState<any[]>([])
  const [avgResults, setAvgResults] = useState<any[]>([])
  const [awards, setAwards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const calculate = async () => {
      // 1. Scarica TUTTI i dati necessari
      const { data: candidates } = await supabase.from('candidates').select('*').eq('lobby_id', lobby.id)
      const { data: votes } = await supabase.from('votes').select('*').eq('lobby_id', lobby.id)
      const { data: participants } = await supabase.from('lobby_participants').select('*').eq('lobby_id', lobby.id)

      if (!candidates || !votes || candidates.length === 0) return

      const factors = lobby.settings.factors || []

      // 2. Calcola con i motori
      const sRes = calculateSchulze(candidates, votes, factors)
      const aRes = calculateAverage(candidates, votes, factors)
      const socialAwards = calculateSocialAwards(participants || [], votes, factors)

      setSchulzeResults(sRes)
      setAvgResults(aRes)
      setAwards(socialAwards)
      setLoading(false)
    }

    calculate()
  }, [lobby, supabase])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="animate-spin text-4xl text-indigo-500">⏳</div>
    </div>
  )

  const winner = schulzeResults[0]
  const popularWinner = avgResults[0]
  const isParadox = winner.id !== popularWinner.id

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-10 pb-32">
      
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* 1. HEADER VINCITORE */}
        <div className="text-center space-y-6 animate-in zoom-in duration-500">
            <div className="inline-block relative">
                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.4)] overflow-hidden mx-auto bg-gray-800">
                    {winner.image_url ? (
                        <img src={winner.image_url} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">👑</div>
                    )}
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black font-black px-6 py-1 rounded-full uppercase tracking-widest text-sm shadow-lg whitespace-nowrap">
                    {t.results.winner_title}
                </div>
            </div>
            
            <div>
                <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-600">
                    {winner.name}
                </h1>
                <p className="text-gray-400 mt-2">{t.results.winner_subtitle}</p>
            </div>
        </div>

        {/* 2. ALERT PARADOSSO (Se esiste) */}
        {isParadox && (
            <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 animate-pulse">
                <div className="text-4xl">⚖️</div>
                <div className="text-left">
                    <h3 className="text-xl font-bold text-red-400 mb-1">{t.results.paradox}</h3>
                    <p className="text-sm text-gray-300">
                        {t.results.paradox_desc} <br/>
                        La media popolare preferiva <strong>{popularWinner.name}</strong>, ma la matematica ha eletto <strong>{winner.name}</strong>.
                    </p>
                </div>
            </div>
        )}

        {/* 3. PREMI SOCIALI (Gamification) */}
        {awards.length > 0 && (
            <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    {t.results.awards_title}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {awards.map((award, i) => (
                        <div key={i} className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex items-center gap-4 hover:border-indigo-500/30 transition-all">
                            <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-white/10 overflow-hidden shrink-0">
                                <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${award.winner.avatar}&backgroundColor=b6e3f4,c0aede,d1d4f9`} className="w-full h-full object-cover"/>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-indigo-300">{award.title}</h3>
                                <div className="text-xl font-black text-white">{award.winner.nick}</div>
                                <p className="text-xs text-gray-500">{award.desc}</p>
                            </div>
                            <div className="ml-auto text-2xl font-mono opacity-50">
                                {award.winner.avg.toFixed(1)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* 4. TABELLA ANALITICA */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold">{t.results.ranking_title}</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-800/50 text-xs uppercase text-gray-400 font-mono">
                        <tr>
                            <th className="p-4">#</th>
                            <th className="p-4">{t.results.col_cand}</th>
                            <th className="p-4 text-center">{t.results.col_win} (Schulze)</th>
                            <th className="p-4 text-center">{t.results.col_avg} (Media)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {schulzeResults.map((r, i) => {
                            // Trova il dato corrispondente nei risultati Average
                            const avgData = avgResults.find(a => a.id === r.id)
                            const isWin = i === 0;

                            return (
                                <tr key={r.id} className={`hover:bg-gray-800/30 ${isWin ? 'bg-yellow-900/10' : ''}`}>
                                    <td className="p-4 font-mono text-gray-500">{i + 1}</td>
                                    <td className="p-4 font-bold flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-gray-800 overflow-hidden">
                                            {r.image_url && <img src={r.image_url} className="w-full h-full object-cover"/>}
                                        </div>
                                        {r.name}
                                        {isWin && <span className="text-yellow-500">🏆</span>}
                                    </td>
                                    <td className="p-4 text-center font-mono text-indigo-400 font-bold">
                                        {r.schulzeWins}
                                    </td>
                                    <td className="p-4 text-center font-mono text-gray-400">
                                        {avgData?.avgScore.toFixed(2)}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  )
}