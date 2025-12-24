'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import ShareModal from '@/components/lobby/share-modal' // <--- IMPORT

// Definiamo i tipi per Typescript
type Candidate = {
  id: string
  name: string
  description: string
  image_url: string | null
}

type Factor = {
  id: string
  name: string
  weight: number
}

export default function LobbyWaiting({ lobby, isHost }: { lobby: any, isHost: boolean }) {
  const { t } = useLanguage()
  const supabase = createClient()
  
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [votes, setVotes] = useState<Record<string, any>>({}) 
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showShare, setShowShare] = useState(false) // <--- STATO MODALE

  // 1. Carica i Candidati
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('candidates')
        .select('*')
        .eq('lobby_id', lobby.id)
      
      if (data) setCandidates(data)
    }
    fetchData()
  }, [lobby.id, supabase])

  // 2. Gestione del cambiamento voto (Input slider)
  const handleVoteChange = (candidateId: string, factorId: string, value: number) => {
    setVotes(prev => ({
      ...prev,
      [candidateId]: {
        ...(prev[candidateId] || {}),
        [factorId]: value
      }
    }))
  }

  // 3. Invio Voti al Database
  const submitVotes = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        toast.error("Utente non riconosciuto")
        return
    }

    // Prepariamo l'array di voti da inviare
    const votesPayload = candidates.map(candidate => {
      const candidateVotes = votes[candidate.id] || {}
      
      const currentFactors = lobby.settings.factors || []
      const scores = currentFactors.reduce((acc: any, factor: Factor) => {
        acc[factor.id] = candidateVotes[factor.id] || 0
        return acc
      }, {})

      return {
        lobby_id: lobby.id,
        voter_id: user.id,
        candidate_id: candidate.id,
        scores: scores,
        updated_at: new Date().toISOString()
      }
    })

    const { error } = await supabase
      .from('votes')
      .upsert(votesPayload, { onConflict: 'voter_id,candidate_id' })

    if (error) {
      toast.error("Errore invio: " + error.message)
    } else {
      toast.success("Voti registrati con successo!")
      setHasVoted(true)
    }
    setLoading(false)
  }

  // --- RENDER ---
  
  if (lobby.status === 'ended') return null

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 pb-64">
      <header className="max-w-3xl mx-auto mb-8 text-center space-y-2 relative">
        <div className="inline-block bg-indigo-900/30 px-4 py-1 rounded-full text-indigo-300 text-sm font-bold border border-indigo-500/30">
            LOBBY: {lobby.code}
        </div>
        
        {/* Bottone Share Piccolo (Posizionato in alto a destra rispetto al titolo) */}
        <button 
            onClick={() => setShowShare(true)}
            className="absolute top-0 right-0 md:right-[-50px] p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-all text-xl"
            title={t.lobby.share_btn}
        >
            📲
        </button>

        <h1 className="text-3xl md:text-4xl font-bold">{t.lobby.waiting_title}</h1>
        <p className="text-gray-400 text-sm md:text-base whitespace-pre-line">
            {t.lobby.waiting_subtitle}
        </p>
      </header>

      <div className="max-w-3xl mx-auto space-y-6">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="bg-gray-900 rounded-2xl p-5 md:p-6 border border-gray-800 shadow-xl">
            
            {/* SEZIONE CANDIDATO */}
            <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 shrink-0 bg-gray-800 rounded-full flex items-center justify-center text-2xl overflow-hidden border border-gray-700">
                    {candidate.image_url ? (
                        <img src={candidate.image_url} alt={candidate.name} className="w-full h-full object-cover" />
                    ) : (
                        '🍕'
                    )} 
                </div>
                
                <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-bold break-words leading-tight">{candidate.name}</h3>
                    <p className="text-gray-400 text-sm mt-1 break-words text-balance">
                        {candidate.description || "Nessuna descrizione."}
                    </p>
                </div>
            </div>

            {/* SLIDER DEI FATTORI */}
            <div className="space-y-6 border-t border-gray-800 pt-6">
                {(lobby.settings.factors || []).map((factor: Factor) => (
                    <div key={factor.id}>
                        <div className="flex justify-between mb-2 items-center">
                            <label className="text-sm font-bold text-gray-300 uppercase tracking-wider truncate mr-2">
                                {factor.name}
                            </label>
                            <span className="text-indigo-400 font-mono font-bold bg-indigo-900/20 px-2 py-0.5 rounded text-sm">
                                {votes[candidate.id]?.[factor.id] ?? 0}/10
                            </span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="10" 
                            step="1"
                            value={votes[candidate.id]?.[factor.id] ?? 0}
                            onChange={(e) => handleVoteChange(candidate.id, factor.id, parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                        />
                        <div className="flex justify-between text-[10px] text-gray-600 px-1 mt-1 font-mono uppercase">
                            <span>Pessimo</span>
                            <span>Eccellente</span>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER FISSO */}
      <div className="fixed bottom-0 left-0 w-full bg-gray-950/90 backdrop-blur-lg border-t border-gray-800 p-4 z-50">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-3">
            <button
                onClick={submitVotes}
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 text-lg"
            >
                {loading ? t.lobby.sending : (hasVoted ? t.lobby.update_btn : t.lobby.vote_btn)}
            </button>
            
            {isHost && (
                <button
                    onClick={async () => {
                         if(confirm(t.lobby.terminate_confirm)) {
                             await supabase.from('lobbies').update({ status: 'ended' }).eq('id', lobby.id)
                         }
                    }}
                    className="px-6 py-4 bg-red-950/50 hover:bg-red-900/80 border border-red-900 text-red-200 font-bold rounded-xl transition-all text-sm md:text-base whitespace-nowrap"
                >
                    {t.lobby.terminate_btn}
                </button>
            )}
        </div>
      </div>

      {/* MODALE DI CONDIVISIONE */}
      {showShare && <ShareModal code={lobby.code} onClose={() => setShowShare(false)} />}
    </div>
  )
}