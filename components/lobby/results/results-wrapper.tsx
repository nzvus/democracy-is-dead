'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { useConfirm } from '@/components/providers/confirm-provider'
import { UI } from '@/lib/constants'
import { Factor, Candidate } from '@/types'

// NEW ENGINE
import { calculateAllSystems } from '@/core/voting/engine'
import { calculateAwards, BadgeType } from '@/core/gamification/awards'
import { VotingResult } from '@/core/voting/types'

// Components
import RankingTable from './ranking-table'
import ResultsChart from './results-chart'
import Podium from './podium'
import ShareLobby from '../share-lobby'
import InfoButton from '@/components/ui/info-button'
import ResultsMatrix from './results-matrix' // (Vecchio User Matrix)
import SchulzeMatrix from './schulze-matrix' // (Nuovo Schulze Matrix)

interface ResultsWrapperProps {
  lobby: any, isHost: boolean, userId: string
}

export default function ResultsWrapper({ lobby, isHost, userId }: ResultsWrapperProps) {
  const { t } = useLanguage()
  const supabase = createClient()
  const { confirm } = useConfirm()
  
  // STATO
  const [results, setResults] = useState<Record<string, VotingResult> | null>(null)
  const [activeSystem, setActiveSystem] = useState<'weighted' | 'borda' | 'schulze'>('weighted')
  const [badges, setBadges] = useState<Record<string, BadgeType[]>>({})
  
  // Dati Grezzi
  const [rawCandidates, setRawCandidates] = useState<Candidate[]>([])
  const [rawVotes, setRawVotes] = useState<any[]>([])
  const [participants, setParticipants] = useState<any[]>([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const [c, v, p] = await Promise.all([
            supabase.from('candidates').select('*').eq('lobby_id', lobby.id),
            supabase.from('votes').select('*').eq('lobby_id', lobby.id),
            supabase.from('lobby_participants').select('*').eq('lobby_id', lobby.id)
        ])

        const candidates = c.data || []
        const votes = v.data || []
        const parts = p.data || []
        const factors = lobby.settings.factors || []
        const maxScale = lobby.settings.voting_scale?.max || 10

        setRawCandidates(candidates)
        setRawVotes(votes)
        setParticipants(parts)

        if (candidates.length > 0) {
            // 1. Calcola Tutti i Sistemi
            const calculated = calculateAllSystems(candidates, votes, factors, maxScale)
            setResults(calculated)

            // 2. Calcola Badge (usa Schulze e Weighted come riferimenti)
            const calculatedBadges = calculateAwards(parts, votes, calculated.schulze, calculated.weighted, maxScale)
            setBadges(calculatedBadges)
        }
      } catch (e) {
        console.error(e)
        toast.error(t.common.error)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [lobby.id])

  if (loading || !results) return <div className="min-h-screen flex items-center justify-center text-white"><span className="animate-spin text-4xl">⏳</span></div>

  const activeResult = results[activeSystem]

  return (
    <div className={`min-h-screen bg-gray-950 text-white ${UI.LAYOUT.PADDING_X} pb-32 pt-6 flex flex-col items-center overflow-x-hidden`}>
      <div className="w-full max-w-5xl space-y-12 flex flex-col">
        
        {/* HEADER & TABS */}
        <header className="flex flex-col items-center gap-6 relative z-30">
            <ShareLobby code={lobby.code} compact={true} />
            
            <div className="flex bg-gray-900 p-1 rounded-2xl border border-gray-800 shadow-xl">
                {(['weighted', 'borda', 'schulze'] as const).map((sys) => (
                    <button 
                        key={sys} 
                        onClick={() => setActiveSystem(sys)} 
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2
                            ${activeSystem === sys ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'text-gray-500 hover:text-gray-300'}
                        `}
                    >
                        {t.results.systems[sys].title}
                        <InfoButton topicKey={sys} className={activeSystem === sys ? "text-indigo-200" : "text-gray-600"} />
                    </button>
                ))}
            </div>
        </header>

        {/* PODIUM */}
        <section className="mt-4 z-10">
            <Podium top3={activeResult.ranking.slice(0, 3)} />
        </section>

        {/* MAIN CONTENT GRID */}
        <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Left: Ranking List */}
            <section className="space-y-4">
                 <div className="flex items-center gap-2 px-1">
                    <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest">{t.results.ranking_title}</h3>
                </div>
                <RankingTable results={activeResult.ranking} scores={activeResult.scores} system={activeSystem} />
            </section>

            {/* Right: Charts or Matrix */}
            <section className="space-y-8">
                {/* Se siamo su Schulze, mostriamo la Matrice, altrimenti il Radar */}
                {activeSystem === 'schulze' && activeResult.details?.matrix ? (
                    <SchulzeMatrix candidates={rawCandidates} matrix={activeResult.details.matrix} />
                ) : (
                    <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6 min-h-[400px]">
                        <ResultsChart results={activeResult.ranking} factors={lobby.settings.factors} />
                    </div>
                )}
            </section>
        </div>

        {/* FULL DATA MATRIX (VOTI UTENTI) */}
        <section className="w-full space-y-4 pt-8 border-t border-gray-900">
             <div className="flex items-center gap-2 mb-2 px-1">
                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest">{t.results.matrix_title}</h3>
            </div>
            <ResultsMatrix candidates={rawCandidates} participants={participants} votes={rawVotes} currentUserId={userId} badges={badges} />
        </section>
      </div>
    </div>
  )
}