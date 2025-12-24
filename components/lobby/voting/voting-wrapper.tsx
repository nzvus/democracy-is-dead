'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/client'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { getScoreColor } from './utils'

export default function VotingWrapper({ lobby, userId, isHost }: { lobby: any, userId: string, isHost: boolean }) {
  const { t } = useLanguage()
  const supabase = createClient()
  
  // Dati
  const [candidates, setCandidates] = useState<any[]>([])
  const [votes, setVotes] = useState<Record<string, Record<string, number>>>({})
  const [loading, setLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [participants, setParticipants] = useState<any[]>([]) // MONITORAGGIO

  // Configurazione
  const factors = lobby.settings.factors || []
  const maxScale = lobby.settings.voting_scale?.max || 10
  const allowDecimals = lobby.settings.allow_decimals || false
  const step = allowDecimals ? 0.1 : 1

  // UI State
  const [activeFactorId, setActiveFactorId] = useState<string | null>(factors[0]?.id || null)

  // 1. Fetch Dati Iniziali e Partecipanti
  useEffect(() => {
    const fetch = async () => {
        const { data: cands } = await supabase.from('candidates').select('*').eq('lobby_id', lobby.id).order('name')
        if (cands) setCandidates(cands)

        const { data: existingVotes } = await supabase.from('votes').select('*').eq('lobby_id', lobby.id).eq('voter_id', userId)
        if (existingVotes && existingVotes.length > 0) {
            const voteMap: any = {}
            existingVotes.forEach((v: any) => {
                voteMap[v.candidate_id] = v.scores
            })
            setVotes(voteMap)
            setHasSubmitted(true)
        }

        const { data: parts } = await supabase.from('lobby_participants').select('*').eq('lobby_id', lobby.id)
        if (parts) setParticipants(parts)
    }
    fetch()

    // 2. Realtime Partecipanti (Chi ha confermato?)
    const channel = supabase.channel('voting_status')
        .on('postgres_changes', 
            { event: 'UPDATE', schema: 'public', table: 'lobby_participants', filter: `lobby_id=eq.${lobby.id}` }, 
            (payload) => {
                setParticipants(prev => prev.map(p => p.id === payload.new.id ? payload.new : p))
            }
        )
        .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [lobby.id, userId, supabase])

  // Gestione Voto
  const handleVote = (candId: string, factId: string, val: number) => {
    const safeVal = Math.min(Math.max(val, 0), maxScale)
    setVotes(prev => ({
        ...prev,
        [candId]: { ...(prev[candId] || {}), [factId]: safeVal }
    }))
    setHasSubmitted(false) // Se tocchi, devi riconfermare
  }

  // Invio Voti
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
    
    // Aggiorna stato utente a "ha votato"
    await supabase.from('lobby_participants').update({ has_voted: true }).eq('lobby_id', lobby.id).eq('user_id', userId)

    if (error) toast.error("Errore invio")
    else {
        toast.success("Scheda inviata correttamente")
        setHasSubmitted(true)
    }
    setLoading(false)
  }

  // Funzione Admin per chiudere
  const endVoting = async () => {
    if(!confirm("Sei sicuro di voler terminare la votazione? Tutti passeranno ai risultati.")) return;
    await supabase.from('lobbies').update({ status: 'ended' }).eq('id', lobby.id)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 pb-52 flex flex-col items-center">
        
        {/* HEADER */}
        <header className="max-w-2xl w-full text-center mb-6 pt-4 space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t.lobby.voting.title}</h1>
            <p className="text-gray-400 text-sm max-w-md mx-auto">{t.lobby.voting.subtitle}</p>
        </header>

        {/* MONITORAGGIO PARTECIPANTI (Visibile a tutti) */}
        <div className="w-full max-w-2xl mb-6 bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
            <h3 className="text-xs font-bold uppercase text-gray-500 mb-3 flex justify-between">
                <span>Stato Sala</span>
                <span>{participants.filter(p=>p.has_voted).length} / {participants.length}</span>
            </h3>
            <div className="flex flex-wrap gap-2">
                {participants.map(p => (
                    <div key={p.id} className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 transition-all ${p.has_voted ? 'bg-green-900/30 border-green-500/50 text-green-400' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>
                        {p.nickname}
                        {p.has_voted && <span>✓</span>}
                    </div>
                ))}
            </div>
        </div>

        {/* LISTA FATTORI */}
        <div className="w-full max-w-2xl space-y-4">
            {factors.map((factor: any) => {
                const isActive = activeFactorId === factor.id
                
                return (
                    <div 
                        key={factor.id} 
                        className={`border rounded-3xl overflow-hidden transition-all duration-300 ${
                            isActive 
                            ? 'bg-gray-900/80 border-indigo-500/50 shadow-[0_0_30px_-10px_rgba(99,102,241,0.3)]' 
                            : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
                        }`}
                    >
                        {/* HEADER FATTORE */}
                        <button 
                            onClick={() => setActiveFactorId(isActive ? null : factor.id)}
                            className="w-full p-5 flex items-center justify-between outline-none"
                        >
                            <div className="flex flex-col items-start text-left">
                                <span className={`text-sm font-bold tracking-widest uppercase ${isActive ? 'text-indigo-400' : 'text-gray-400'}`}>
                                    Criterio
                                </span>
                                <span className="text-xl md:text-2xl font-black flex items-center gap-2">
                                    {factor.name}
                                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded border border-gray-700 font-mono font-normal">
                                        x{factor.weight}
                                    </span>
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                {!isActive && (
                                    <div className="flex gap-1">
                                        {candidates.map(c => {
                                            const val = votes[c.id]?.[factor.id] || 0
                                            const color = getScoreColor(val, maxScale)
                                            return (
                                                <div key={c.id} className="w-2 h-6 rounded-full opacity-80" style={color.style} />
                                            )
                                        })}
                                    </div>
                                )}
                                <div className={`text-2xl transition-transform duration-300 ${isActive ? 'rotate-180' : 'rotate-0'}`}>▼</div>
                            </div>
                        </button>

                        {/* LISTA CANDIDATI PER IL FATTORE */}
                        {isActive && (
                            <div className="px-5 pb-8 space-y-8 animate-in slide-in-from-top-2 duration-200">
                                <div className="h-px w-full bg-gray-800 mb-4" />
                                
                                {candidates.map((candidate) => {
                                    const score = votes[candidate.id]?.[factor.id] || 0
                                    const colorProps = getScoreColor(score, maxScale)

                                    return (
                                        <div key={candidate.id} className="group">
                                            <div className="flex justify-between items-end mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-gray-800 overflow-hidden shrink-0 border border-gray-700">
                                                        {candidate.image_url ? (
                                                            <img src={candidate.image_url} className="w-full h-full object-cover"/>
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-xl leading-none">{candidate.name}</span>
                                                </div>
                                                
                                                <div className={`px-4 py-2 rounded-xl text-xl font-bold font-mono min-w-[4rem] text-center transition-all ${colorProps.className}`} style={colorProps.style}>
                                                    {score}
                                                </div>
                                            </div>

                                            {/* SLIDER MAGGIORATO PER MOBILE */}
                                            <input 
                                                type="range"
                                                min="0"
                                                max={maxScale}
                                                step={step} // STEP DINAMICO (es. 0.1 o 1)
                                                value={score}
                                                onChange={(e) => handleVote(candidate.id, factor.id, Number(e.target.value))}
                                                className="w-full h-12 bg-gray-800 rounded-2xl appearance-none cursor-pointer accent-indigo-500 touch-none shadow-inner"
                                            />
                                            
                                            <div className="flex justify-between px-2 mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                <span>Min</span>
                                                <span>Max</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="fixed bottom-0 left-0 w-full p-6 bg-gray-950/95 backdrop-blur-xl border-t border-gray-800 z-50 flex flex-col gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            
            <button 
                onClick={submitAll}
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                    hasSubmitted 
                    ? 'bg-gray-800 text-green-400 border border-green-900/50' 
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-indigo-900/30'
                }`}
            >
                {loading ? '...' : (hasSubmitted ? 'SCHEDA INVIATA ✓' : 'CONFERMA VOTI')}
            </button>

            {isHost && (
                <button 
                    onClick={endVoting}
                    className="w-full py-3 bg-red-950/30 text-red-400 border border-red-900/50 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-900/50 transition-colors"
                >
                    Termina Votazione per Tutti
                </button>
            )}
        </div>

    </div>
  )
}