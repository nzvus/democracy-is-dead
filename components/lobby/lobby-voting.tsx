'use client'

import { useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  candidates: any[]
  onSubmit: (votes: Record<string, any>) => Promise<void>
}

export function LobbyVoting({ candidates, onSubmit }: Props) {
  const [votes, setVotes] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)

  const handleSubmit = async () => {
    
    
    setIsSubmitting(true)
    try {
      await onSubmit(votes)
      setHasVoted(true)
      toast.success("Voti inviati con successo!")
    } catch (error) {
      toast.error("Errore nell'invio dei voti")
      setIsSubmitting(false)
    }
  }

  if (hasVoted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-in zoom-in duration-300">
        <CheckCircle size={80} className="text-green-500 mb-6" />
        <h2 className="text-3xl font-bold mb-2">Voti Registrati!</h2>
        <p className="text-gray-400">Rilassati mentre gli altri finiscono.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto w-full pb-32">
      <header className="text-center mb-10">
        <h1 className="text-3xl font-black mb-2">Scheda Elettorale</h1>
        <p className="text-gray-400">Valuta ogni candidato da 0 a 10</p>
      </header>

      <div className="space-y-6">
        {candidates.map((cand) => (
          <div key={cand.id} className="bg-gray-900 p-6 rounded-2xl border border-gray-800 transition-all hover:border-gray-700">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-xl font-bold">{cand.name}</h3>
              <span className="text-2xl font-mono font-bold text-indigo-400">
                {votes[cand.id] || 0}
              </span>
            </div>
            
            <input 
              type="range" 
              min="0" 
              max="10" 
              step="1"
              value={votes[cand.id] || 0}
              onChange={(e) => setVotes(prev => ({...prev, [cand.id]: parseInt(e.target.value)}))}
              className="w-full h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2 uppercase font-bold tracking-wider">
              <span>Pessimo</span>
              <span>Mediocre</span>
              <span>Eccellente</span>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-gray-950/90 backdrop-blur border-t border-gray-800">
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle />}
            CONFERMA VOTI
          </button>
        </div>
      </div>
    </div>
  )
}