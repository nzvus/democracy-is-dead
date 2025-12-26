'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { calculateMultiSystemResults, VotingSystem } from '@/lib/voting-engine'
import { calculateBadges, BadgeType } from '@/lib/gamification'
import { useLanguage } from '@/components/providers/language-provider'
import { Factor, Candidate } from '@/types'
import { UI } from '@/lib/constants'
import { toast } from 'sonner'
import { useConfirm } from '@/components/providers/confirm-provider' 

import RankingTable from './ranking-table'
import ResultsMatrix from './results-matrix'
import ResultsChart from './results-chart'
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
  const { confirm } = useConfirm() 
  
  const [allResults, setAllResults] = useState<Record<VotingSystem, Candidate[]> | null>(null)
  const [activeSystem, setActiveSystem] = useState<VotingSystem>('weighted')
  const [activeChart, setActiveChart] = useState<'radar' | 'compare'>('radar')
  
  const [loading, setLoading] = useState(true)
  const [reopening, setReopening] = useState(false)

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
            const calculated = calculateMultiSystemResults(candidates, votes, factors, lobby.settings.voting_scale?.max || 10)
            setAllResults(calculated)
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
  }, [lobby.id, supabase, factors, t.common.error, lobby.settings.voting_scale?.max])

  const handleReopen = async () => {
      const isConfirmed = await confirm({
          title: t.results.reopen_btn,
          description: t.results.reopen_confirm,
          confirmText: "Riapri Voto",
          variant: 'danger'
      })

      if (!isConfirmed) return

      setReopening(true)
      const { error } = await supabase.from('lobbies').update({ status: 'voting' }).eq('id', lobby.id)
      if (error) { toast.error(t.common.error); setReopening(false) }
      else toast.success("Votazione riaperta!")
  }

  if (loading || !allResults) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white"><div className="animate-spin text-4xl">⏳</div></div>

  const currentResults = allResults[activeSystem]
  const currentChartDesc = activeChart === 'radar' ? t.results.charts.radar_desc : t.results.charts.compare_desc

  return (
    <div className={`min-h-screen bg-gray-950 text-white ${UI.LAYOUT.PADDING_X} pb-32 pt-6 flex flex-col items-center overflow-x-hidden`}>
      <div className="w-full max-w-5xl space-y-12 flex flex-col">
        
        {}
        <header className="flex flex-col items-center gap-4 relative z-30">
            <ShareLobby code={lobby.code} compact={true} />
            <div className="flex bg-gray-900 p-1 rounded-2xl border border-gray-800 shadow-xl overflow-x-auto max-w-full no-scrollbar">
                {(['weighted', 'borda', 'median'] as VotingSystem[]).map((sys) => (
                    <button key={sys} onClick={() => setActiveSystem(sys)} className={`px-4 md:px-6 py-2 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeSystem === sys ? 'bg-gray-700 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>
                        {t.results.systems[sys].title}
                    </button>
                ))}
            </div>
            <div className="w-full max-w-lg bg-indigo-950/30 border border-indigo-500/20 p-3 rounded-xl text-center">
                <p className="text-indigo-200 text-xs font-medium leading-relaxed">
                    <strong className="text-white uppercase tracking-wider mr-2">{t.results.systems[activeSystem].title}:</strong>
                    {t.results.systems[activeSystem].desc}
                </p>
            </div>
        </header>

        {}
        <section className="mt-8 z-10">
            <Podium top3={currentResults.slice(0, 3)} />
        </section>

        {}
        <section className={`${UI.COLORS.BG_CARD} border border-gray-800 ${UI.LAYOUT.ROUNDED_LG} shadow-2xl w-full overflow-hidden`}>
            <div className="flex border-b border-gray-800 bg-gray-900/50">
                 <button onClick={() => setActiveChart('radar')} className={`flex-1 py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeChart === 'radar' ? 'border-yellow-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>{t.results.charts.radar}</button>
                 <button onClick={() => setActiveChart('compare')} className={`flex-1 py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeChart === 'compare' ? 'border-indigo-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>{t.results.charts.comparison}</button>
            </div>
            <div className="bg-gray-900/30 py-2 px-4 text-center border-b border-gray-800/50">
                <p className="text-[10px] md:text-xs text-gray-500 italic">{currentChartDesc}</p>
            </div>
            <div className="p-2 md:p-8 min-h-[450px] flex items-center justify-center w-full">
                <div className="w-full h-full">
                    {activeChart === 'radar' ? <ResultsChart results={currentResults} factors={factors} /> : <ComparisonChart allResults={allResults} candidates={rawCandidates} />}
                </div>
            </div>
        </section>

        {}
        <section className="w-full space-y-4">
            <div className="flex items-center gap-2 mb-2 px-1">
                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest">{t.results.ranking_title}</h3>
                <InfoButton title={t.results.ranking_title} desc={t.results.math_legend_desc} />
            </div>
            <div className="-mx-4 md:mx-0">
                <RankingTable results={currentResults} factors={factors} />
            </div>
        </section>

        {}
        <section className="w-full space-y-4">
             <div className="flex items-center gap-2 mb-2 px-1">
                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest">{t.results.matrix_title}</h3>
                <InfoButton title={t.results.matrix_title} desc={t.results.matrix_subtitle} />
            </div>
            <div className="-mx-4 md:mx-0">
                <ResultsMatrix candidates={rawCandidates} participants={participants} votes={rawVotes} currentUserId={userId} badges={userBadges} />
            </div>
        </section>

        {}
        {isHost && (
             <div className="w-full bg-indigo-950/20 p-6 rounded-2xl border border-indigo-900/30 flex flex-col items-center justify-center gap-4">
                <button onClick={handleReopen} disabled={reopening} className="w-full md:w-auto px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all border border-gray-600 hover:border-white shadow-lg active:scale-95 flex justify-center items-center gap-2">
                    {reopening ? <span className="animate-spin">⏳</span> : <>🔄 {t.results.reopen_btn}</>}
                </button>
            </div>
        )}
      </div>
    </div>
  )
}