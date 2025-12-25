'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { calculateResults } from '@/lib/voting-engine'
import { useLanguage } from '@/components/providers/language-provider'
import { Factor } from '@/types'
import { UI } from '@/lib/constants'

// Componenti Sotto-cartella o Genitore
import RankingTable from './ranking-table'
import ShareLobby from '../share-lobby'

export default function ResultsWrapper({ lobby }: { lobby: any }) {
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

      // 2. Calcola con il motore
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
        
        {/* 1. HEADER VINCITORE & SHARE */}
        <div className="text-center space-y-6 relative">
            <div className="absolute right-0 top-0 hidden md:block">
                 <ShareLobby code={lobby.code} compact={true} />
            </div>

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

            <div className="md:hidden flex justify-center mt-4">
                 <ShareLobby code={lobby.code} compact={true} />
            </div>
        </div>

        {/* 2. TABELLA ANALITICA (Componente Separato) */}
        <RankingTable results={results} factors={factors} />

        {/* 3. LEGENDA MATEMATICA */}
        <div className="bg-black/30 p-6 rounded-2xl border border-gray-800 text-xs text-gray-500 leading-relaxed">
            <h3 className="font-bold text-gray-300 mb-2">{t.results.math_legend_title}</h3>
            <p>{t.results.math_legend_desc}</p>
        </div>

      </div>
    </div>
  )
}