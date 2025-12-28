'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { UI } from '@/lib/constants'
import { Candidate, Participant, Factor } from '@/types'
import { useConfirm } from '@/components/providers/confirm-provider' 

import { calculateAllSystems } from '@/core/voting/engine'
import { calculateAwards, BadgeType } from '@/core/gamification/awards'
import { VotingResult, VoteRecord } from '@/core/voting/types'

import RankingTable from './ranking-table'
import Podium from './podium'
import ShareLobby from '../share-lobby'
import InfoButton from '@/components/ui/info-button'
import ResultsMatrix from './results-matrix'
import SchulzeMatrix from './schulze-matrix'
import ComparisonChart from './comparison-chart'
import { RefreshCcw } from 'lucide-react' 

interface LobbySettings {
    factors: Factor[];
    voting_scale?: { max: number };
    allow_decimals?: boolean;
}

interface ResultsWrapperProps {
  lobby: {
      id: string;
      code: string;
      settings: LobbySettings; 
  }
  isHost: boolean 
  userId: string
}

interface SchulzeDetails {
    matrix: Record<string, Record<string, number>>;
    winners: string[];
}

export default function ResultsWrapper({ lobby, userId, isHost }: ResultsWrapperProps) {
  const { t } = useLanguage()
  const supabase = createClient()
  const { confirm } = useConfirm() 
  
  const [results, setResults] = useState<Record<string, VotingResult> | null>(null)
  const [activeSystem, setActiveSystem] = useState<'weighted' | 'borda' | 'schulze'>('weighted')
  const [badges, setBadges] = useState<Record<string, BadgeType[]>>({})
  
  const [rawCandidates, setRawCandidates] = useState<Candidate[]>([])
  const [rawVotes, setRawVotes] = useState<VoteRecord[]>([]) 
  const [participants, setParticipants] = useState<Participant[]>([])

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
        
        const settings = (lobby.settings || {}) as unknown as LobbySettings
        const factors = settings.factors || []
        const maxScale = settings.voting_scale?.max || 10

        setRawCandidates(candidates)
        setRawVotes(votes)
        setParticipants(parts)

        if (candidates.length > 0) {
            const calculated = calculateAllSystems(candidates, votes, factors, maxScale)
            setResults(calculated)
            const calculatedBadges = calculateAwards(parts, votes, calculated.schulze)
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

  
  const handleReopen = async () => {
      const confirmed = await confirm({
          title: t.results.reopen_btn,
          description: t.results.reopen_confirm,
          variant: 'danger',
          confirmText: t.common.yes
      })

      if (confirmed) {
          const { error } = await supabase.from('lobbies').update({ status: 'voting' }).eq('id', lobby.id)
          if (error) toast.error(t.common.error)
          else toast.success("Voting Reopened!")
      }
  }

  if (loading || !results) return <div className="min-h-screen flex items-center justify-center text-white"><span className="animate-spin text-4xl">⏳</span></div>

  const activeResult = results[activeSystem]
  const schulzeDetails = activeSystem === 'schulze' ? (activeResult.details as unknown as SchulzeDetails) : null

  return (
    <div className={`min-h-screen bg-gray-950 text-white ${UI.LAYOUT.PADDING_X} pb-32 pt-6 flex flex-col items-center overflow-x-hidden`}>
      <div className="w-full max-w-5xl space-y-12 flex flex-col">
        
        <header className="flex flex-col items-center gap-6 relative z-30">
            <ShareLobby code={lobby.code} compact={true} />
            
            {}
            <div className="flex bg-gray-900 p-1 rounded-2xl border border-gray-800 shadow-xl overflow-x-auto max-w-full">
                {(['weighted', 'borda', 'schulze'] as const).map((sys) => (
                    <button 
                        key={sys} 
                        onClick={() => setActiveSystem(sys)} 
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap
                            ${activeSystem === sys ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'text-gray-500 hover:text-gray-300'}
                        `}
                    >
                        {t.results.systems[sys].title}
                        <InfoButton topicKey={sys} className={activeSystem === sys ? "text-indigo-200" : "text-gray-600"} />
                    </button>
                ))}
            </div>
        </header>

        <section className="mt-4 z-10">
            <Podium top3={activeResult.ranking.slice(0, 3)} />
        </section>

        <div className="grid lg:grid-cols-2 gap-8">
            <section className="space-y-4">
                 <div className="flex items-center gap-2 px-1">
                    <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest">{t.results.ranking_title}</h3>
                </div>
                <RankingTable results={activeResult.ranking} scores={activeResult.scores} system={activeSystem} />
            </section>

            <section className="space-y-8">
                {activeSystem === 'schulze' && schulzeDetails ? (
                    <SchulzeMatrix candidates={rawCandidates} matrix={schulzeDetails.matrix} />
                ) : (
                    <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6 min-h-[400px]">
                        <ComparisonChart weighted={results.weighted} borda={results.borda} schulze={results.schulze} />
                    </div>
                )}
            </section>
        </div>

        <section className="w-full space-y-4 pt-8 border-t border-gray-900">
             <div className="flex items-center gap-2 mb-2 px-1">
                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest">{t.results.matrix_title}</h3>
            </div>
            <ResultsMatrix candidates={rawCandidates} participants={participants} votes={rawVotes} currentUserId={userId} badges={badges} />
        </section>

        {}
        {isHost && (
            <div className="fixed bottom-6 left-0 w-full flex justify-center z-50 pointer-events-none">
                <button 
                    onClick={handleReopen}
                    className="pointer-events-auto bg-red-900/80 hover:bg-red-800 border border-red-500/50 text-white px-6 py-3 rounded-full font-bold shadow-2xl backdrop-blur-xl flex items-center gap-2 transition-all hover:scale-105"
                >
                    <RefreshCcw size={18} /> {t.results.reopen_btn}
                </button>
            </div>
        )}
      </div>
    </div>
  ) 
}