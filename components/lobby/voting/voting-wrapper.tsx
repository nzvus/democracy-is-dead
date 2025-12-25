'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/client'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { UI } from '@/lib/constants'
import { Factor, Candidate, Participant } from '@/types'
import { QRCodeSVG } from 'qrcode.react' 

const getScoreColor = (score: number, max: number, isLowerBetter: boolean) => {
  let normalized = score / max
  if (isLowerBetter) normalized = 1 - normalized
  if (normalized < 0.3) return 'bg-red-500'
  if (normalized < 0.7) return 'bg-yellow-500'
  return 'bg-green-500'
}

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
  const [infoOpen, setInfoOpen] = useState<string | null>(null)
  const [showQR, setShowQR] = useState(false)
  
  // Modal Candidato
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  const factors: Factor[] = lobby.settings.factors || []
  const maxScale = lobby.settings.voting_scale?.max || 10
  const allowDecimals = lobby.settings.allow_decimals || false
  const step = allowDecimals ? 0.1 : 1

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
        // Ascolta modifiche ai candidati (es. Host cambia valore statico)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'candidates', filter: `lobby_id=eq.${lobby.id}` },
        (payload) => {
             const updatedCand = payload.new as Candidate
             setCandidates(prev => prev.map(c => c.id === updatedCand.id ? updatedCand : c))
        })
        .subscribe()
        
    return () => { supabase.removeChannel(channel) }
  }, [lobby.id, userId])

  const handleVote = (candId: string, factId: string, val: number) => {
    const safeVal = Math.min(Math.max(val, 0), maxScale)
    setVotes(prev => ({ ...prev, [candId]: { ...(prev[candId] || {}), [factId]: safeVal } }))
    setHasSubmitted(false) 
  }

  // Host aggiorna valore statico
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
        
        {/* HEADER & QR TOGGLE */}
        <header className={`w-full ${UI.LAYOUT.MAX_WIDTH_CONTAINER} flex items-start justify-between mt-4 mb-6`}>
             <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">{t.lobby.voting.title}</h1>
                <p className="text-gray-400 text-xs">{t.lobby.voting.subtitle}</p>
             </div>
             <button onClick={() => setShowQR(!showQR)} className="bg-gray-800 p-2 rounded-xl border border-gray-700 text-xl" title={t.lobby.voting.scan_to_join}>
                📱
             </button>
        </header>

        {/* QR CODE OVERLAY */}
        {showQR && (
            <div className={`w-full ${UI.LAYOUT.MAX_WIDTH_CONTAINER} mb-6 bg-white text-black p-6 rounded-3xl flex flex-col items-center animate-in slide-in-from-top-4`}>
                <QRCodeSVG value={`${window.location.origin}/lobby/${lobby.code}`} size={150} />
                <p className="font-bold text-xl mt-4 tracking-widest">{lobby.code}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase">{t.lobby.voting.scan_to_join}</p>
                <button onClick={() => setShowQR(false)} className="mt-4 text-xs font-bold underline">{t.lobby.voting.close}</button>
            </div>
        )}

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

        {/* LISTA FATTORI */}
        <div className={`w-full ${UI.LAYOUT.MAX_WIDTH_CONTAINER} space-y-6`}>
            {factors.map((factor) => {
                const isActive = activeFactorId === factor.id
                const isLowerBetter = factor.trend === 'lower_better'
                const isStatic = factor.type === 'static'
                const borderColor = isActive ? (isLowerBetter ? 'border-amber-500/50' : `border-${UI.COLORS.PRIMARY}-500/50`) : 'border-gray-800'
                const bgStyle = isActive ? (isLowerBetter ? 'bg-amber-950/10' : 'bg-indigo-950/10') : 'bg-gray-900/40'

                return (
                    <div key={factor.id} className={`border ${UI.LAYOUT.ROUNDED_LG} overflow-hidden transition-all duration-300 ${borderColor} ${bgStyle}`}>
                        {/* HEADER FATTORE (Click to expand) */}
                        <div className="p-5">
                            <button onClick={() => setActiveFactorId(isActive ? null : factor.id)} className="w-full flex items-center justify-between outline-none">
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                                        {factor.image_url ? <img src={factor.image_url} className="w-full h-full object-cover" /> : <span className="text-xl">📊</span>}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xl font-black">{factor.name}</span>
                                            {isLowerBetter ? <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono uppercase tracking-wider ${UI.COLORS.TREND_LOW}`}>↘ LOW</span> : <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono uppercase tracking-wider ${UI.COLORS.TREND_HIGH}`}>↗ HIGH</span>}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mt-1">
                                            <span>x{factor.weight}</span>
                                            {isStatic && <span className="text-amber-500"> • {t.setup.factor_type_static}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className={`text-xl transition-transform ${isActive ? 'rotate-180' : ''}`}>▼</div>
                            </button>
                            
                            {/* INFO BOX */}
                            {isActive && (
                                <div className="mt-3 pl-[4rem]">
                                    <button onClick={() => setInfoOpen(infoOpen === factor.id ? null : factor.id)} className="text-[10px] uppercase font-bold tracking-widest text-gray-500 hover:text-white flex items-center gap-1 transition-colors">ℹ️ {t.lobby.voting.trend_explanation}</button>
                                    {infoOpen === factor.id && (
                                        <div className="mt-2 p-3 bg-black/40 rounded-xl text-xs text-gray-300 border border-white/5 animate-in fade-in slide-in-from-top-1">
                                            <p className="mb-1">{isLowerBetter ? t.lobby.voting.trend_info_low : t.lobby.voting.trend_info_high}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* BODY VOTAZIONE */}
                        {isActive && (
                            <div className="px-5 pb-8 space-y-8 border-t border-gray-800/50 pt-6 animate-in slide-in-from-top-2">
                                {candidates.map((candidate) => {
                                    const score = votes[candidate.id]?.[factor.id] || 0
                                    const barColor = getScoreColor(score, maxScale, isLowerBetter)
                                    const staticVal = candidate.static_values?.[factor.id] ?? 0

                                    return (
                                        <div key={candidate.id} className="group">
                                            <div className="flex justify-between items-end mb-4">
                                                {/* CANDIDATE INFO & POPUP TRIGGER */}
                                                <div 
                                                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => setSelectedCandidate(candidate)}
                                                    title={t.lobby.voting.click_details}
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-gray-800 overflow-hidden shrink-0 border border-gray-700 relative group-hover:ring-2 ring-indigo-500">
                                                        {candidate.image_url ? <img src={candidate.image_url} className="w-full h-full object-cover"/> : <span className="flex items-center justify-center h-full">👤</span>}
                                                        {/* Badge Info al passaggio mouse */}
                                                        <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-[8px] uppercase font-bold text-white backdrop-blur-[1px]">{t.lobby.voting.info_badge}</div>
                                                    </div>
                                                    <span className="font-bold text-lg leading-none border-b border-transparent group-hover:border-gray-500 transition-colors">{candidate.name}</span>
                                                </div>
                                                
                                                {!isStatic && (
                                                    <div className={`w-12 h-10 flex items-center justify-center rounded-lg text-lg font-bold font-mono transition-colors text-white ${barColor}`}>
                                                        {score}
                                                    </div>
                                                )}
                                            </div>

                                            {/* INPUTS */}
                                            {isStatic ? (
                                                <div className="bg-black/20 p-3 rounded-xl border border-gray-800 flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 font-bold uppercase">{t.lobby.voting.static_value_label}</span>
                                                    {isHost ? (
                                                        <input 
                                                            type="number" 
                                                            value={staticVal}
                                                            onChange={(e) => handleStaticUpdate(candidate.id, factor.id, Number(e.target.value))}
                                                            className="w-24 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-right font-mono font-bold focus:border-indigo-500 outline-none transition-all"
                                                        />
                                                    ) : (
                                                        <span className="font-mono font-bold text-lg">{staticVal}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <input 
                                                        type="range" min="0" max={maxScale} step={step} value={score}
                                                        onChange={(e) => handleVote(candidate.id, factor.id, Number(e.target.value))}
                                                        className={`w-full h-10 bg-gray-800 rounded-xl appearance-none cursor-pointer touch-none shadow-inner accent-${isLowerBetter ? 'amber' : 'indigo'}-500`}
                                                    />
                                                    <div className="flex justify-between px-1 mt-1 text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                                                        <span>0</span><span>{maxScale}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>

        {/* MODAL DETTAGLI CANDIDATO */}
        {selectedCandidate && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedCandidate(null)}>
                <div className={`w-full max-w-sm ${UI.COLORS.BG_CARD} p-6 ${UI.LAYOUT.ROUNDED_LG} relative shadow-2xl space-y-4`} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setSelectedCandidate(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center transition-colors">×</button>
                    
                    <div className="w-24 h-24 rounded-2xl bg-gray-800 mx-auto overflow-hidden border-2 border-gray-700 shadow-lg">
                        {selectedCandidate.image_url ? <img src={selectedCandidate.image_url} className="w-full h-full object-cover"/> : <span className="flex items-center justify-center h-full text-4xl">👤</span>}
                    </div>
                    
                    <div className="text-center">
                        <h2 className="text-2xl font-black">{selectedCandidate.name}</h2>
                        <div className={`h-1 w-10 bg-${UI.COLORS.PRIMARY}-500 mx-auto mt-2 rounded-full`}></div>
                    </div>

                    <div className="bg-black/20 p-4 rounded-xl border border-gray-800/50 max-h-60 overflow-y-auto custom-scrollbar">
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                            {selectedCandidate.description || <span className="italic text-gray-600">{t.lobby.voting.no_description}</span>}
                        </p>
                    </div>
                </div>
            </div>
        )}

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