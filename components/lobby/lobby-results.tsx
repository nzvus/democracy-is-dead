'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
// Importiamo il nuovo motore di calcolo potenziato
import { calculateResults } from '@/lib/voting-engine' 
import { useLanguage } from '@/components/providers/language-provider'
import { Factor, Candidate, Participant } from '@/types'

export default function LobbyResults({ lobby }: { lobby: any }) {
  const { t } = useLanguage()
  const supabase = createClient()
  
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [factors, setFactors] = useState<Factor[]>([])

  useEffect(() => {
    const calculate = async () => {
      // 1. Scarica TUTTI i dati necessari
      const { data: candidates } = await supabase.from('candidates').select('*').eq('lobby_id', lobby.id)
      const { data: votes } = await supabase.from('votes').select('*').eq('lobby_id', lobby.id)
      
      // I fattori sono salvati nel JSON della lobby
      const currentFactors = lobby.settings.factors || []
      setFactors(currentFactors)

      if (!candidates || !votes || candidates.length === 0) {
          setLoading(false)
          return
      }

      // 2. Calcola con il motore avanzato (che gestisce Z-Score e Dati Statici)
      const calculated = calculateResults(
          candidates, 
          votes, 
          currentFactors, 
          lobby.settings.voting_scale?.max || 10
      )

      setResults(calculated)
      setLoading(false)
    }

    calculate()
  }, [lobby, supabase])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="animate-spin text-4xl text-indigo-500">⏳</div>
    </div>
  )

  if (results.length === 0) return <div className="text-white text-center p-10">Nessun dato disponibile.</div>

  const winner = results[0]

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-10 pb-32">
      
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* 1. HEADER VINCITORE */}
        <div className="text-center space-y-6 animate-in zoom-in duration-500 pt-10">
            <div className="inline-block relative">
                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-yellow-500 shadow-[0_0_80px_rgba(234,179,8,0.3)] overflow-hidden mx-auto bg-gray-800">
                    {winner.image_url ? (
                        <img src={winner.image_url} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">🏆</div>
                    )}
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black font-black px-6 py-2 rounded-full uppercase tracking-widest text-sm shadow-lg whitespace-nowrap">
                    Vincitore Assoluto
                </div>
            </div>
            
            <div>
                <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-600">
                    {winner.name}
                </h1>
                <p className="text-gray-400 mt-2 font-mono text-xl">
                    Punteggio: <span className="text-yellow-400 font-bold">{winner.finalScore.toFixed(2)}</span>
                </p>
            </div>
        </div>

        {/* 2. TABELLA ANALITICA DETTAGLIATA */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 bg-gray-800/50">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    📊 Classifica & Dettagli
                </h2>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-950 text-xs uppercase text-gray-400 font-mono tracking-wider">
                        <tr>
                            <th className="p-4 w-10 text-center">#</th>
                            <th className="p-4 min-w-[200px]">Candidato</th>
                            <th className="p-4 text-right text-yellow-500 font-bold border-l border-gray-800">SCORE</th>
                            
                            {/* Colonne dinamiche per ogni fattore */}
                            {factors.map(f => (
                                <th key={f.id} className="p-4 text-center border-l border-gray-800 min-w-[100px]">
                                    <div className="flex flex-col items-center">
                                        <span>{f.name}</span>
                                        <span className="text-[9px] opacity-50 font-normal">
                                            {f.type === 'static' ? (f.trend === 'lower_better' ? '↘ Basso è meglio' : '↗ Alto è meglio') : 'Voto Utenti'}
                                        </span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {results.map((r, i) => {
                            const isWin = i === 0;

                            return (
                                <tr key={r.id} className={`group hover:bg-gray-800/30 transition-colors ${isWin ? 'bg-yellow-900/10' : ''}`}>
                                    <td className="p-4 text-center font-mono text-gray-500 font-bold text-lg">{i + 1}</td>
                                    
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-800 overflow-hidden shrink-0 border border-gray-700">
                                                {r.image_url && <img src={r.image_url} className="w-full h-full object-cover"/>}
                                            </div>
                                            <div>
                                                <div className="font-bold text-lg leading-tight flex items-center gap-2">
                                                    {r.name}
                                                    {isWin && <span className="text-xl">🥇</span>}
                                                </div>
                                                {r.description && <div className="text-xs text-gray-500 line-clamp-1">{r.description}</div>}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-4 text-right font-black text-2xl font-mono text-yellow-400 border-l border-gray-800 bg-gray-900/30">
                                        {r.finalScore.toFixed(1)}
                                    </td>

                                    {/* Celle Dati Dinamici */}
                                    {factors.map(f => {
                                        // Recuperiamo il valore grezzo per mostrarlo (es. "3.50€")
                                        // E usiamo il valore normalizzato (score 0-10) per colorare la cella o dare contesto
                                        
                                        let displayValue: string | number = "-"
                                        let normalizedScore = r.debugDetails[f.name] || 0 // Punteggio matematico 0-10

                                        if (f.type === 'static') {
                                            displayValue = r.static_values?.[f.id] ?? "-"
                                            // Aggiungi suffisso se necessario (es. €) - TODO: Aggiungere suffisso in Config
                                        } else {
                                            // Voto medio utenti
                                            displayValue = normalizedScore.toFixed(1)
                                        }

                                        // Colore basato sulla bontà del dato (normalizedScore alto = verde)
                                        const colorIntensity = Math.min(Math.max(normalizedScore / 10, 0), 1) // 0 to 1
                                        const isGood = normalizedScore > 6

                                        return (
                                            <td key={f.id} className="p-4 text-center border-l border-gray-800 relative">
                                                 {/* Barra di sfondo sottile per indicare visivamente la qualità */}
                                                <div 
                                                    className="absolute bottom-0 left-0 h-1 bg-indigo-500/50 transition-all" 
                                                    style={{ width: `${normalizedScore * 10}%`, opacity: 0.3 }}
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

        {/* 3. LEGENDA MATEMATICA (Trasparenza) */}
        <div className="bg-black/30 p-6 rounded-2xl border border-gray-800 text-sm text-gray-400">
            <h3 className="font-bold text-white mb-2">📐 Come è stato calcolato?</h3>
            <p>
                Il punteggio finale combina i <strong>voti soggettivi</strong> (normalizzati) e i <strong>dati oggettivi</strong> (come il prezzo).
                <br/>
                Per i fattori oggettivi, abbiamo usato una normalizzazione <em>Min-Max</em> inversa o diretta in base alla preferenza (es. prezzo più basso = punteggio più alto).
            </p>
        </div>

      </div>
    </div>
  )
}