'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/client'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { UI } from '@/lib/constants'
import { Factor, Candidate, Participant } from '@/types'
import ShareLobby from '@/components/lobby/share-lobby'
import VotingFactorSection from './voting-factor-section'

export default function VotingWrapper({ lobby, userId, isHost }: { lobby: any, userId: string, isHost: boolean }) {
  const { t } = useLanguage()
  const supabase = createClient()
  
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [votes, setVotes] = useState<Record<string, Record<string, number>>>({})
  const [loading, setLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // UI State
  const [activeFactorId, setActiveFactorId] = useState<string | null>(null)
  // NOTA: Abbiamo rimosso 'selectedCandidate' e il modale info, ora usiamo il tooltip.

  const factors: Factor[] = lobby.settings.factors || []
  const maxScale = lobby.settings.voting_scale?.max || 10
  const step = lobby.settings.allow_decimals ? 0.1 : 1

  useEffect(() => {
    const init = async () => {
        const { data: cands } = await supabase.from('candidates').select('*').eq('lobby_id', lobby.id).order('name')
        if (cands) setCandidates(cands)

        const { data: parts } = await supabase.from('lobby_participants').select('*').eq('lobby_id', lobby.id)
        if (parts) setParticipants(parts)

        const { data: existingVotes } = await supabase.from('votes').select('*').eq('lobby_id', lobby.id).eq('voter_id', userId)
        if (existingVotes && existingVotes.length > 0) {
            const voteMap: any = {}
            existingVotes.forEach((v: any) => { voteMap[v.candidate_id] = v.scores })
            setVotes(voteMap)
            setHasSubmitted(true)
        }
        
        if (factors.length > 0) setActiveFactorId(factors[0].id)
    }
    init()

    const channel = supabase.channel('voting_room')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lobby_participants', filter: `lobby_id=eq.${lobby.id}` }, 
        (payload) => {
            const updatedParticipant = payload.new as Participant
            setParticipants(prev => prev.map(p => p.id === updatedParticipant.id ? updatedParticipant : p))
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'candidates', filter: `lobby_id=eq.${lobby.id}` },
        (payload) => {
             const updatedCand = payload.new as Candidate
             setCandidates(prev => prev.map(c => c.id === updatedCand.id ? updatedCand : c))
        })
        .subscribe()
        
    return () => { supabase.removeChannel(channel) }
  }, [lobby.id, userId, factors])

  const handleVote = (candId: string, factId: string, val: number) => {
    const safeVal = Math.min(Math.max(val, 0), maxScale)
    setVotes(prev => ({ ...prev, [candId]: { ...(prev[candId] || {}), [factId]: safeVal } }))
    setHasSubmitted(false) 
  }

  const handleStaticUpdate = async (candId: string, factId: string, val: number) => {
      setCandidates(prev => prev.map(c => {
          if (c.id !== candId) return c;
          return { ...c, static_values: { ...(c.static_values || {}), [factId]: val } }
      }))
      const candidate = candidates.find(c => c.id === candId)
      const newStatic = { ...(candidate?.static_values || {}), [factId]: val }
      await supabase.from('candidates').update({ static_values: newStatic }).eq('id', candId)
  }

  const submitAll = async () => {
    setLoading(true)
    const payload = candidates.map(c => ({
        lobby_id: lobby.id,
        voter_id: userId,
        candidate_id: c.id,
        scores: votes[c.id] || {},
        updated_at: new Date().toISOString()
    }))

    const { error } = await supabase.from('votes').upsert(payload, { onConflict: 'voter_id,candidate_id' })
    await supabase.from('lobby_participants').update({ has_voted: true }).eq('lobby_id', lobby.id).eq('user_id', userId)

    if (error) toast.error(t.common.error)
    else {
        toast.success(t.lobby.voting.submitted_msg)
        setHasSubmitted(true)
    }
    setLoading(false)
  }

  const endVoting = async () => {
      if(!confirm(t.lobby.terminate_confirm)) return;
      await supabase.from('lobbies').update({ status: 'ended' }).eq('id', lobby.id)
  }

  return (
    <div className={`min-h-screen bg-gray-950 text-white ${UI.LAYOUT.PADDING_X} pb-52 flex flex-col items-center relative`}>
        
        {/* HEADER & SHARE */}
        <header className={`w-full ${UI.LAYOUT.MAX_WIDTH_CONTAINER} flex items-start justify-between mt-6 mb-6`}>
             <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">{t.lobby.voting.title}</h1>
                <p className="text-gray-400 text-xs">{t.lobby.voting.subtitle}</p>
             </div>
             <ShareLobby code={lobby.code} compact={true} />
        </header>

        {/* MONITORAGGIO PARTECIPANTI */}
        <div className={`w-full ${UI.LAYOUT.MAX_WIDTH_CONTAINER} mb-6 bg-gray-900/50 p-4 ${UI.LAYOUT.ROUNDED_MD} border border-gray-800`}>
            <h3 className="text-[10px] font-bold uppercase text-gray-500 mb-3 flex justify-between">
                <span>{t.lobby.status_label}</span>
                <span>{participants.filter(p=>p.has_voted).length} / {participants.length}</span>
            </h3>
            <div className="flex flex-wrap gap-2">
                {participants.map(p => (
                    <div key={p.id} className={`px-2 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 transition-all ${p.has_voted ? 'bg-green-900/30 border-green-500/50 text-green-400' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>
                        {p.avatar_url ? <img src={p.avatar_url} className="w-4 h-4 rounded-full"/> : <span>👤</span>}
                        {p.nickname}
                        {p.has_voted && <span>✓</span>}
                    </div>
                ))}
            </div>
        </div>

        {/* LISTA FATTORI DI VOTO */}
        <div className={`w-full ${UI.LAYOUT.MAX_WIDTH_CONTAINER} space-y-6`}>
            {factors.map((factor) => (
                <VotingFactorSection 
                    key={factor.id}
                    factor={factor}
                    isActive={activeFactorId === factor.id}
                    candidates={candidates}
                    votes={votes}
                    maxScale={maxScale}
                    step={step}
                    isHost={isHost}
                    onToggle={() => setActiveFactorId(activeFactorId === factor.id ? null : factor.id)}
                    onVote={(candId, val) => handleVote(candId, factor.id, val)}
                    onStaticUpdate={(candId, val) => handleStaticUpdate(candId, factor.id, val)}
                />
            ))}
        </div>

        {/* FOOTER ACTIONS */}
        <div className={`fixed bottom-0 left-0 w-full p-6 bg-gray-950/95 backdrop-blur-xl border-t border-gray-800 z-50 flex flex-col gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]`}>
            <button onClick={submitAll} disabled={loading} className={`w-full ${UI.LAYOUT.MAX_WIDTH_CONTAINER} mx-auto py-4 ${UI.LAYOUT.ROUNDED_MD} font-black text-lg shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${hasSubmitted ? 'bg-gray-800 text-green-400 border border-green-900/50' : `bg-gradient-to-r from-${UI.COLORS.PRIMARY}-600 to-${UI.COLORS.PRIMARY}-700 text-white shadow-${UI.COLORS.PRIMARY}-900/30`}`}>
                {loading ? t.common.loading : (hasSubmitted ? t.lobby.voting.submitted_msg : t.lobby.voting.submit_btn)}
            </button>
            {isHost && <button onClick={endVoting} className={`w-full ${UI.LAYOUT.MAX_WIDTH_CONTAINER} mx-auto py-3 bg-red-950/20 text-red-400 border border-red-900/30 ${UI.LAYOUT.ROUNDED_MD} font-bold text-xs uppercase tracking-widest hover:bg-red-900/40 transition-colors`}>{t.lobby.terminate_btn}</button>}
        </div>
    </div>
  )
}