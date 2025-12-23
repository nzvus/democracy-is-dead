'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

// Definiamo i tipi per Typescript per non avere errori rossi
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
  const supabase = createClient()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [votes, setVotes] = useState<Record<string, any>>({}) // Mappa: candidate_id -> { factor_id: score }
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(false)

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
      
      // Se l'utente non ha toccato uno slider, mettiamo 0 di default
      // (Nota: Per Schulze servirebbe il ranking, ma per ora usiamo i punteggi come da setup attuale)
      const scores = lobby.settings.factors.reduce((acc: any, factor: Factor) => {
        acc[factor.id] = candidateVotes[factor.id] || 0
        return acc
      }, {})

      return {
        lobby_id: lobby.id,
        voter_id: user.id,
        candidate_id: candidate.id,
        scores: scores, // Salviamo il JSON complesso: {"general": 8, "gusto": 9}
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
  
  // Se la lobby è finita (status === 'ended'), mostriamo un messaggio (poi faremo i grafici)
  if (lobby.status === 'ended') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <h1 className="text-4xl font-bold mb-4">🗳️ Elezione Terminata</h1>
        <p>Calcolo dei risultati in corso...</p>
        {/* Qui metteremo i grafici Schulze nella prossima fase */}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 pb-24">
      <header className="max-w-3xl mx-auto mb-8 text-center">
        <div className="inline-block bg-indigo-900/30 px-4 py-1 rounded-full text-indigo-300 text-sm font-bold mb-2 border border-indigo-500/30">
            LOBBY: {lobby.code}
        </div>
        <h1 className="text-3xl font-bold">Scheda Elettorale</h1>
        <p className="text-gray-400 text-sm mt-2">
            Assegna un punteggio ai candidati. <br/>
            (Il voto è segreto e matematicamente protetto).
        </p>
      </header>

      <div className="max-w-3xl mx-auto space-y-8">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
                {/* Placeholder per l'immagine se c'è */}
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-2xl">
                    {candidate.image_url ? '📷' : '🍕'} 
                </div>
                <div>
                    <h3 className="text-xl font-bold">{candidate.name}</h3>
                    <p className="text-gray-400 text-sm">{candidate.description || "Nessuna descrizione."}</p>
                </div>
            </div>

            {/* Generazione dinamica degli slider in base ai fattori impostati dall'admin */}
            <div className="space-y-6">
                {lobby.settings.factors.map((factor: Factor) => (
                    <div key={factor.id}>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                                {factor.name}
                            </label>
                            <span className="text-indigo-400 font-mono font-bold">
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
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                    </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer fisso con bottone di invio */}
      <div className="fixed bottom-0 left-0 w-full bg-gray-950/80 backdrop-blur-md border-t border-gray-800 p-4">
        <div className="max-w-3xl mx-auto flex gap-4">
            <button
                onClick={submitVotes}
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
                {loading ? 'Invio in corso...' : (hasVoted ? 'Aggiorna Voto ↻' : 'Conferma Voti ✅')}
            </button>
            
            {isHost && (
                <button
                    onClick={async () => {
                         if(confirm("Sei sicuro di voler chiudere le urne?")) {
                             await supabase.from('lobbies').update({ status: 'ended' }).eq('id', lobby.id)
                         }
                    }}
                    className="px-6 bg-red-900/50 hover:bg-red-900 border border-red-800 text-red-200 font-bold rounded-xl transition-all"
                >
                    Termina
                </button>
            )}
        </div>
      </div>
    </div>
  )
}