'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { getScoreColor } from './utils'

export default function VotingWrapper({ lobby, userId }: { lobby: any, userId: string }) {
  const { t } = useLanguage()
  const supabase = createClient()
  
  // Dati
  const [candidates, setCandidates] = useState<any[]>([])
  const [votes, setVotes] = useState<Record<string, Record<string, number>>>({})
  const [loading, setLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // UI State: Quale fattore è aperto? (Default: il primo)
  const factors = lobby.settings.factors || []
  const maxScale = lobby.settings.voting_scale?.max || 10
  const [activeFactorId, setActiveFactorId] = useState<string | null>(factors[0]?.id || null)

  // 1. Fetch Dati
  useEffect(() => {
    const fetch = async () => {
        const { data } = await supabase.from('candidates').select('*').eq('lobby_id', lobby.id).order('name')
        if (data) setCandidates(data)

        const { data: existingVotes } = await supabase.from('votes').select('*').eq('lobby_id', lobby.id).eq('voter_id', userId)
        if (existingVotes && existingVotes.length > 0) {
            const voteMap: any = {}
            existingVotes.forEach((v: any) => {
                voteMap[v.candidate_id] = v.scores
            })
            setVotes(voteMap)
            setHasSubmitted(true)
        }
    }
    fetch()
  }, [lobby.id, userId])

  // 2. Gestione Voto
  const handleVote = (candId: string, factId: string, val: number) => {
    // Clamp value tra 0 e maxScale
    const safeVal = Math.min(Math.max(val, 0), maxScale)
    
    setVotes(prev => ({
        ...prev,
        [candId]: { ...(prev[candId] || {}), [factId]: safeVal }
    }))
    setHasSubmitted(false)
  }

  // 3. Invio
  const submitAll = async () => {
    setLoading(true)
    
    // Validazione: controlliamo se mancano voti? (Opzionale: per ora lasciamo votare 0)
    
    const payload = candidates.map(c => ({
        lobby_id: lobby.id,
        voter_id: userId,
        candidate_id: c.id,
        scores: votes[c.id] || {},
        updated_at: new Date().toISOString()
    }))

    const { error } = await supabase.from('votes').upsert(payload, { onConflict: 'voter_id,candidate_id' })
    await supabase.from('lobby_participants').update({ has_voted: true }).eq('lobby_id', lobby.id).eq('user_id', userId)

    if (error) toast.error("Errore invio")
    else {
        toast.success("Scheda inviata correttamente")
        setHasSubmitted(true)
    }
    setLoading(false)
  }

  // Helper per calcolare se un fattore è completo (tutti hanno un voto > 0)
  // Nota: Questo è solo visivo, il sistema accetta anche 0.
  const isFactorComplete = (factId: string) => {
    return candidates.every(c => (votes[c.id]?.[factId] !== undefined))
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 pb-40 flex flex-col items-center">
        
        {/* HEADER */}
        <header className="max-w-2xl w-full text-center mb-6 pt-4 space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t.lobby.voting.title}</h1>
            <p className="text-gray-400 text-sm max-w-md mx-auto">{t.lobby.voting.subtitle}</p>
        </header>

        {/* LISTA FATTORI (ACCORDION) */}
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
                        {/* HEADER DEL FATTORE (Click per aprire) */}
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

                            {/* Stato / Icona */}
                            <div className="flex items-center gap-3">
                                {!isActive && (
                                    // Mini Heatmap quando chiuso: mostra dei pallini colorati per i voti dati
                                    <div className="flex gap-1">
                                        {candidates.map(c => {
                                            const val = votes[c.id]?.[factor.id] || 0
                                            const color = getScoreColor(val, maxScale)
                                            return (
                                                <div 
                                                    key={c.id} 
                                                    className="w-2 h-6 rounded-full opacity-80"
                                                    style={color.style}
                                                />
                                            )
                                        })}
                                    </div>
                                )}
                                <div className={`text-2xl transition-transform duration-300 ${isActive ? 'rotate-180' : 'rotate-0'}`}>
                                    ▼
                                </div>
                            </div>
                        </button>

                        {/* CONTENUTO ESPANSO (Lista Candidati per questo fattore) */}
                        {isActive && (
                            <div className="px-5 pb-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                                <div className="h-px w-full bg-gray-800 mb-4" />
                                
                                {candidates.map((candidate) => {
                                    const score = votes[candidate.id]?.[factor.id] || 0
                                    const colorProps = getScoreColor(score, maxScale)

                                    return (
                                        <div key={candidate.id} className="group">
                                            {/* Info Candidato + Badge Voto */}
                                            <div className="flex justify-between items-end mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-800 overflow-hidden shrink-0 border border-gray-700">
                                                        {candidate.image_url ? (
                                                            <img src={candidate.image_url} className="w-full h-full object-cover"/>
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-lg leading-none">{candidate.name}</span>
                                                </div>
                                                
                                                {/* Badge Valore */}
                                                <div 
                                                    className={`px-3 py-1 rounded-lg text-lg font-bold font-mono min-w-[3rem] text-center transition-all ${colorProps.className}`}
                                                    style={colorProps.style}
                                                >
                                                    {score}
                                                </div>
                                            </div>

                                            {/* SLIDER ONESTO E GRANDE */}
                                            <input 
                                                type="range"
                                                min="0"
                                                max={maxScale}
                                                step={maxScale > 10 ? 1 : 0.5}
                                                value={score}
                                                onChange={(e) => handleVote(candidate.id, factor.id, Number(e.target.value))}
                                                className="w-full h-4 bg-gray-800 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 touch-none"
                                            />
                                            
                                            {/* Etichette scala */}
                                            <div className="flex justify-between px-1 mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
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

        {/* FOOTER AZIONE */}
        <div className="fixed bottom-0 left-0 w-full p-4 bg-gray-950/90 backdrop-blur-xl border-t border-gray-800 z-50">
            <div className="max-w-2xl mx-auto flex gap-4 items-center">
                
                {/* Info Progress */}
                <div className="hidden md:flex flex-col text-xs text-gray-400">
                    <span className="font-bold text-white">Scheda Elettorale</span>
                    <span>{hasSubmitted ? 'Sincronizzato' : 'Modifiche non salvate'}</span>
                </div>

                <button 
                    onClick={submitAll}
                    disabled={loading}
                    className={`flex-1 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                        hasSubmitted 
                        ? 'bg-gray-800 text-green-400 border border-green-900/50' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'
                    }`}
                >
                    {loading ? '...' : (hasSubmitted ? t.lobby.voting.submitted_msg : t.lobby.voting.submit_btn)}
                </button>
            </div>
        </div>

    </div>
  )
}