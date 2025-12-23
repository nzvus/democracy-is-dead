'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

export default function LobbySetup({ lobby, userId }: { lobby: any, userId: string }) {
  const supabase = createClient()
  const [candidates, setCandidates] = useState<any[]>([])
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [loading, setLoading] = useState(false)

  // Carica i candidati esistenti
  useEffect(() => {
    const fetchCandidates = async () => {
      const { data } = await supabase.from('candidates').select('*').eq('lobby_id', lobby.id)
      if (data) setCandidates(data)
    }
    fetchCandidates()
  }, [lobby.id, supabase])

  // Aggiunge un candidato al DB
  const addCandidate = async () => {
    if (!newName.trim()) return
    
    // Inseriamo anche "attributes" vuoto per supportare i fattori futuri
    const { data, error } = await supabase
      .from('candidates')
      .insert([{ 
        lobby_id: lobby.id, 
        name: newName, 
        description: newDesc,
        attributes: {} 
      }])
      .select()
      .single()

    if (error) {
      toast.error("Errore: " + error.message)
    } else {
      setCandidates([...candidates, data])
      setNewName('')
      setNewDesc('')
      toast.success("Candidato aggiunto!")
    }
  }

  // Fa partire l'elezione (Cambia stato da 'setup' a 'voting')
  const startElection = async () => {
    if (candidates.length < 2) {
      toast.error("Servono almeno 2 candidati per votare!")
      return
    }
    setLoading(true)
    const { error } = await supabase
      .from('lobbies')
      .update({ status: 'voting' }) // <-- Questo sblocca tutti gli ospiti
      .eq('id', lobby.id)

    if (error) toast.error("Impossibile avviare")
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="border-b border-gray-800 pb-6">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            Setup Elezione: {lobby.code}
          </h1>
          <p className="text-gray-400 mt-2">Configura candidati e regole prima di aprire le porte.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* COLONNA SINISTRA: Aggiungi Candidato */}
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              ➕ Aggiungi Candidato
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold">Nome (es. Buitoni, Mario Rossi)</label>
                <input 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Nome del candidato..."
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold">Descrizione / Note</label>
                <textarea 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 mt-1 h-24 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Ingredienti, dettagli, slogan..."
                />
              </div>
              <button 
                onClick={addCandidate}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold shadow-lg shadow-indigo-900/20 transition-all"
              >
                Aggiungi alla Lista
              </button>
            </div>
          </div>

          {/* COLONNA DESTRA: Lista Candidati */}
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 flex flex-col h-full">
            <h2 className="text-xl font-bold mb-4">📋 In Gara ({candidates.length})</h2>
            
            <div className="flex-1 overflow-y-auto space-y-3 max-h-[400px] pr-2 custom-scrollbar">
              {candidates.length === 0 ? (
                <p className="text-gray-500 italic text-center py-10">Nessun candidato ancora.</p>
              ) : (
                candidates.map((c) => (
                  <div key={c.id} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <div>
                      <h3 className="font-bold text-white">{c.name}</h3>
                      {c.description && <p className="text-xs text-gray-400 truncate max-w-[200px]">{c.description}</p>}
                    </div>
                    <button 
                        onClick={async () => {
                            await supabase.from('candidates').delete().eq('id', c.id)
                            setCandidates(candidates.filter(item => item.id !== c.id))
                        }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/30 p-2 rounded transition-colors"
                    >
                        🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM BAR: Azioni Finali */}
        <div className="flex justify-end pt-6 border-t border-gray-800">
            <button
                onClick={startElection}
                disabled={loading}
                className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded-xl shadow-xl shadow-green-900/20 transition-all hover:scale-105 flex items-center gap-2"
            >
                {loading ? 'Avvio...' : '🚀 APRI LE VOTAZIONI'}
            </button>
        </div>

      </div>
    </div>
  )
}