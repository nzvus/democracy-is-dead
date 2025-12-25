'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { calculateResults } from '@/lib/voting-engine'
import { useLanguage } from '@/components/providers/language-provider'
import { Factor } from '@/types'
import { UI } from '@/lib/constants'
import { toast } from 'sonner'

// Componenti
import RankingTable from './ranking-table'
import ResultsMatrix from './results-matrix'
import ShareLobby from '../share-lobby'

interface ResultsWrapperProps {
  lobby: any
  isHost: boolean
  userId: string
}

export default function ResultsWrapper({ lobby, isHost, userId }: ResultsWrapperProps) {
  const { t } = useLanguage()
  const supabase = createClient()
  
  // State per i risultati calcolati
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reopening, setReopening] = useState(false)

  // State per i dati grezzi (necessari per la Matrice)
  const [rawCandidates, setRawCandidates] = useState<any[]>([])
  const [rawVotes, setRawVotes] = useState<any[]>([])
  const [participants, setParticipants] = useState<any[]>([])

  const factors: Factor[] = lobby.settings.factors || []

  useEffect(() => {
    const fetchDataAndCalculate = async () => {
      try {
        // 1. Fetch parallelo di tutti i dati necessari
        const [candsRes, votesRes, partsRes] = await Promise.all([
            supabase.from('candidates').select('*').eq('lobby_id', lobby.id),
            supabase.from('votes').select('*').eq('lobby_id', lobby.id),
            supabase.from('lobby_participants').select('*').eq('lobby_id', lobby.id)
        ])

        if (candsRes.error || votesRes.error || partsRes.error) {
            console.error("Error fetching results data")
            setLoading(false)
            return
        }

        const candidates = candsRes.data || []
        const votes = votesRes.data || []
        const parts = partsRes.data || []

        // 2. Salviamo i dati grezzi per la visualizzazione Matrice
        setRawCandidates(candidates)
        setRawVotes(votes)
        setParticipants(parts)

        if (candidates.length === 0) {
            setLoading(false)
            return
        }

        // 3. Calcoliamo la classifica ponderata
        const calculated = calculateResults(
            candidates, 
            votes, 
            factors, 
            lobby.settings.voting_scale?.max || 10
        )

        setResults(calculated)
      } catch (e) {
        console.error("Calculation error:", e)
        toast.error(t.common.error)
      } finally {
        setLoading(false)
      }
    }

    fetchDataAndCalculate()
  }, [lobby.id, lobby.settings, supabase, factors, t.common.error])

  // Funzione Admin: Riapre la votazione
  const handleReopen = async () => {
      if (!confirm(t.results.reopen_confirm)) return

      setReopening(true)
      const { error } = await supabase
          .from('lobbies')
          .update({ status: 'voting' })
          .eq('id', lobby.id)
      
      if (error) {
          toast.error(t.common.error)
          setReopening(false)
      } else {
          toast.success("Votazione riaperta!")
          // Non serve setReopening(false) perché il componente verrà smontato dal cambio di status in page.tsx
      }
  }

  // --- RENDERING ---

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className={`animate-spin text-4xl text-${UI.COLORS.PRIMARY}-500`}>⏳</div>
    </div>
  )

  if (results.length === 0) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white flex-col gap-4">
        <p className="text-gray-400">Nessun dato disponibile.</p>
        {isHost && <button onClick={handleReopen} className="text-indigo-400 underline">Torna al voto</button>}
    </div>
  )

  const winner = results[0]

  return (
    <div className={`min-h-screen bg-gray-950 text-white ${UI.LAYOUT.PADDING_X} pb-32 pt-10`}>
      
      <div className={`w-full max-w-5xl mx-auto space-y-16 animate-in fade-in duration-500`}>
        
        {/* 1. HEADER VINCITORE */}
        <div className="text-center space-y-6 relative">
            <div className="absolute right-0 top-0 hidden md:block">
                 <ShareLobby code={lobby.code} compact={true} />
            </div>

            <div className="inline-block relative group cursor-pointer hover:scale-105 transition-transform duration-300">
                {/* Alone luminoso */}
                <div className="absolute inset-0 bg-yellow-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                
                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-yellow-500 shadow-[0_0_80px_rgba(234,179,8,0.3)] overflow-hidden mx-auto bg-gray-800 relative z-10">
                    {winner.image_url ? (
                        <img src={winner.image_url} className="w-full h-full object-cover" alt={winner.name} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">🏆</div>
                    )}
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-black px-6 py-2 rounded-full uppercase tracking-widest text-sm shadow-xl whitespace-nowrap z-20">
                    {t.results.winner_title}
                </div>
            </div>
            
            <div>
                <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 mb-2">
                    {winner.name}
                </h1>
                <p className="text-gray-400 font-mono text-xl flex items-center justify-center gap-2">
                    Score: <span className="text-yellow-400 font-bold bg-yellow-900/20 px-2 py-1 rounded">{winner.finalScore.toFixed(2)}</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">{t.results.winner_subtitle}</p>
            </div>

            <div className="md:hidden flex justify-center mt-4">
                 <ShareLobby code={lobby.code} compact={true} />
            </div>
        </div>

        {/* 2. CLASSIFICA DETTAGLIATA */}
        <section>
            <RankingTable results={results} factors={factors} />
        </section>

        {/* 3. MATRICE DEI VOTI (Trasparenza) */}
        <section className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
            <ResultsMatrix 
                candidates={rawCandidates}
                participants={participants}
                votes={rawVotes}
                currentUserId={userId}
            />
        </section>

        {/* 4. LEGENDA & AZIONI */}
        <div className="grid md:grid-cols-2 gap-6 items-start">
            {/* Info Box */}
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 text-xs text-gray-500 leading-relaxed">
                <h3 className="font-bold text-gray-300 mb-2 flex items-center gap-2">
                    🧮 {t.results.math_legend_title}
                </h3>
                <p>{t.results.math_legend_desc}</p>
            </div>

            {/* Admin Box */}
            {isHost && (
                <div className="bg-indigo-950/20 p-6 rounded-2xl border border-indigo-900/30 flex flex-col items-center justify-center gap-4">
                    <div className="text-center">
                        <p className="text-xs text-indigo-400 uppercase font-bold tracking-widest mb-1">Admin Zone</p>
                        <p className="text-[10px] text-gray-500">Qualcosa non va? Puoi riaprire il voto.</p>
                    </div>
                    <button 
                        onClick={handleReopen}
                        disabled={reopening}
                        className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all border border-gray-600 hover:border-white shadow-lg active:scale-95 flex justify-center items-center gap-2"
                    >
                        {reopening ? (
                            <span className="animate-spin">⏳</span> 
                        ) : (
                            <>🔄 {t.results.reopen_btn}</>
                        )}
                    </button>
                </div>
            )}
        </div>

      </div>
    </div>
  )
}