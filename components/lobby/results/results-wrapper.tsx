'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { calculateMultiSystemResults, VotingSystem } from '@/lib/voting-engine' // <-- Usa la nuova funzione
import { calculateBadges, BadgeType } from '@/lib/gamification'
import { useLanguage } from '@/components/providers/language-provider'
import { Factor, Candidate } from '@/types'
import { UI } from '@/lib/constants'
import { toast } from 'sonner'

// Componenti
import RankingTable from './ranking-table'
import ResultsMatrix from './results-matrix'
import ResultsChart from './results-chart' // Assicurati di rinominare/adattare quello vecchio
import Podium from './podium'
import ShareLobby from '../share-lobby'
import InfoButton from '@/components/ui/info-button'
import ComparisonChart from './comparison-chart'

interface ResultsWrapperProps {
  lobby: any
  isHost: boolean
  userId: string
}

export default function ResultsWrapper({ lobby, isHost, userId }: ResultsWrapperProps) {
  const { t } = useLanguage()
  const supabase = createClient()
  
  // Dati Completi Calcolati (Oggetto con chiavi: weighted, borda, median)
  const [allResults, setAllResults] = useState<Record<VotingSystem, Candidate[]> | null>(null)
  
  // Stati UI
  const [activeSystem, setActiveSystem] = useState<VotingSystem>('weighted')
  const [activeChart, setActiveChart] = useState<'radar' | 'compare'>('radar')
  
  const [loading, setLoading] = useState(true)
  const [reopening, setReopening] = useState(false)

  // Dati Grezzi
  const [rawCandidates, setRawCandidates] = useState<any[]>([])
  const [rawVotes, setRawVotes] = useState<any[]>([])
  const [participants, setParticipants] = useState<any[]>([])
  const [userBadges, setUserBadges] = useState<Record<string, BadgeType[]>>({})

  const factors: Factor[] = lobby.settings.factors || []

  useEffect(() => {
    const init = async () => {
      try {
        const [candsRes, votesRes, partsRes] = await Promise.all([
            supabase.from('candidates').select('*').eq('lobby_id', lobby.id),
            supabase.from('votes').select('*').eq('lobby_id', lobby.id),
            supabase.from('lobby_participants').select('*').eq('lobby_id', lobby.id)
        ])

        const candidates = candsRes.data || []
        const votes = votesRes.data || []
        const parts = partsRes.data || []

        setRawCandidates(candidates)
        setRawVotes(votes)
        setParticipants(parts)

        if (candidates.length > 0) {
            // 1. Calcolo Multi-Sistema
            const calculated = calculateMultiSystemResults(
                candidates, 
                votes, 
                factors, 
                lobby.settings.voting_scale?.max || 10
            )
            setAllResults(calculated)

            // 2. Badge (Usiamo il weighted come riferimento per i badge per ora)
            const badges = calculateBadges(parts, votes, calculated.weighted)
            setUserBadges(badges)
        }
      } catch (e) {
        console.error(e)
        toast.error(t.common.error)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [lobby.id, supabase])

  const handleReopen = async () => { /* Logica uguale a prima */ }

  if (loading || !allResults) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white"><div className="animate-spin text-4xl">⏳</div></div>

  // Risultati correnti in base al sistema scelto
  const currentResults = allResults[activeSystem]

  return (
    <div className={`min-h-screen bg-gray-950 text-white ${UI.LAYOUT.PADDING_X} pb-32 pt-8 flex flex-col items-center`}>
      
      <div className="w-full max-w-5xl space-y-12">
        
        {/* 1. HEADER & CONTROLLI SISTEMA */}
        <header className="flex flex-col items-center gap-6">
            <ShareLobby code={lobby.code} compact={true} />
            
            {/* System Selector Tabs */}
            <div className="flex bg-gray-900 p-1 rounded-2xl border border-gray-800 shadow-xl overflow-x-auto max-w-full">
                {(['weighted', 'borda', 'median'] as VotingSystem[]).map((sys) => (
                    <button
                        key={sys}
                        onClick={() => setActiveSystem(sys)}
                        className={`px-6 py-2 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeSystem === sys ? 'bg-gray-700 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {t.results.systems[sys].title}
                        {/* Info Icon Integrata nel Tab */}
                        {activeSystem === sys && (
                            <div onClick={(e) => e.stopPropagation()}>
                                <InfoButton 
                                    title={t.results.systems[sys].title}
                                    desc={t.results.systems[sys].desc}
                                    history={t.results.systems[sys].history}
                                />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </header>

        {/* 2. PODIO (Dinamico in base al sistema) */}
        <section>
            <Podium top3={currentResults.slice(0, 3)} />
        </section>

        {/* 3. AREA GRAFICI & STATISTICHE (Dashboard Card) */}
        <section className={`${UI.COLORS.BG_CARD} border border-gray-800 ${UI.LAYOUT.ROUNDED_LG} overflow-hidden shadow-2xl`}>
            {/* Header Card con Tabs Grafici */}
            <div className="flex border-b border-gray-800 bg-gray-900/50">
                 <button onClick={() => setActiveChart('radar')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeChart === 'radar' ? 'border-yellow-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                    {t.results.charts.radar}
                 </button>
                 <button onClick={() => setActiveChart('compare')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeChart === 'compare' ? 'border-indigo-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                    {t.results.charts.comparison}
                 </button>
            </div>

            {/* Contenuto Grafico */}
            <div className="p-6 md:p-8 min-h-[400px] flex items-center justify-center relative">
                <div className="absolute top-4 right-4 z-10">
                    <InfoButton 
                        title={activeChart === 'radar' ? t.results.charts.radar : t.results.charts.comparison}
                        desc={activeChart === 'radar' ? "Mostra i punti di forza e debolezza su ogni criterio." : "Confronta come cambiano le posizioni in base al sistema di voto scelto."}
                    />
                </div>

                {activeChart === 'radar' ? (
                     <ResultsChart results={currentResults} factors={factors} />
                ) : (
                     <ComparisonChart allResults={allResults} candidates={rawCandidates} />
                )}
            </div>
        </section>

        {/* 4. CLASSIFICA ANALITICA (Tabelle) */}
        <section className="grid lg:grid-cols-1 gap-8">
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest">Dettaglio Numerico</h3>
                    <InfoButton title="Tabella Punteggi" desc="Il dettaglio matematico dei punteggi ottenuti." />
                </div>
                <RankingTable results={currentResults} factors={factors} />
            </div>
        </section>

        {/* 5. MATRICE TRASPARENZA */}
        <section className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest">Matrice Voti</h3>
                <InfoButton title="Chi ha votato cosa" desc="Incrocia i partecipanti con i candidati per rivelare ogni singolo voto (se non anonimo)." />
            </div>
            <ResultsMatrix 
                candidates={rawCandidates}
                participants={participants}
                votes={rawVotes}
                currentUserId={userId}
                badges={userBadges}
            />
        </section>

      </div>
    </div>
  )
}