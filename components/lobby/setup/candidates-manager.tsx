'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/client'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { Candidate, Factor } from '@/types' // Assicurati di aver creato il file types/index.ts

export default function CandidatesManager({ lobby }: { lobby: any }) {
  const { t } = useLanguage()
  const supabase = createClient()

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  
  // Input per nuovo candidato
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newImg, setNewImg] = useState('')
  
  // Filtriamo solo i fattori che richiedono un input dall'admin (Statici)
  const staticFactors = (lobby.settings.factors || []).filter((f: Factor) => f.type === 'static')

  // FETCH INIZIALE
  useEffect(() => {
    fetchCandidates()
  }, [lobby.id])

  const fetchCandidates = async () => {
    const { data } = await supabase
      .from('candidates')
      .select('*')
      .eq('lobby_id', lobby.id)
      .order('created_at', { ascending: true })
    
    if (data) setCandidates(data)
  }

  // AGGIUNTA CANDIDATO
  const addCandidate = async () => {
    if (!newName.trim()) return

    setLoading(true)
    const { error } = await supabase.from('candidates').insert({
      lobby_id: lobby.id,
      name: newName,
      description: newDesc,
      image_url: newImg || null,
      static_values: {} // Inizia vuoto
    })

    if (error) {
      toast.error("Errore creazione candidato")
    } else {
      setNewName('')
      setNewDesc('')
      setNewImg('')
      fetchCandidates()
    }
    setLoading(false)
  }

  // RIMOZIONE
  const removeCandidate = async (id: string) => {
    const { error } = await supabase.from('candidates').delete().eq('id', id)
    if (!error) setCandidates(candidates.filter(c => c.id !== id))
  }

  // AGGIORNAMENTO DATI (Nome, Desc o Valori Statici)
  const updateCandidate = async (id: string, field: string, value: any) => {
    // Aggiornamento ottimistico UI
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))

    const { error } = await supabase
      .from('candidates')
      .update({ [field]: value })
      .eq('id', id)
    
    if (error) toast.error("Errore salvataggio")
  }

  // AGGIORNAMENTO SPECIFICO PER I VALORI STATICI (JSONB)
  const updateStaticValue = async (candidateId: string, factorId: string, value: number) => {
    const candidate = candidates.find(c => c.id === candidateId)
    if (!candidate) return

    const newStaticValues = {
        ...(candidate.static_values || {}),
        [factorId]: value
    }

    // UI Update
    setCandidates(prev => prev.map(c => 
        c.id === candidateId ? { ...c, static_values: newStaticValues } : c
    ))

    // DB Update
    const { error } = await supabase
        .from('candidates')
        .update({ static_values: newStaticValues })
        .eq('id', candidateId)

    if (error) toast.error("Errore salvataggio valore")
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* FORM DI AGGIUNTA */}
      <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 space-y-4">
         <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest text-center">
            {t.setup.add_candidate_title || "Nuovo Candidato"}
         </h3>
         
         <div className="grid md:grid-cols-2 gap-4">
            <input 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t.setup.candidate_name_ph}
                className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-base outline-none focus:border-indigo-500"
            />
            <input 
                value={newImg}
                onChange={(e) => setNewImg(e.target.value)}
                placeholder="URL Immagine (opzionale)"
                className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-base outline-none focus:border-indigo-500"
            />
         </div>
         <textarea 
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder={t.setup.candidate_desc_ph}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm outline-none focus:border-indigo-500 min-h-[80px]"
         />
         <button 
            onClick={addCandidate}
            disabled={loading || !newName.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
         >
            {loading ? '...' : '+ Aggiungi Candidato'}
         </button>
      </div>

      {/* LISTA CANDIDATI */}
      <div className="space-y-4">
        {candidates.map((c) => (
            <div key={c.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 relative group">
                
                {/* Tasto Rimuovi */}
                <button 
                    onClick={() => removeCandidate(c.id)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    Elimina 🗑️
                </button>

                <div className="flex gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-xl overflow-hidden shrink-0">
                        {c.image_url ? (
                            <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                        )}
                    </div>
                    <div className="flex-1 space-y-2">
                        <input 
                            value={c.name}
                            onChange={(e) => updateCandidate(c.id, 'name', e.target.value)}
                            className="bg-transparent font-bold text-lg w-full outline-none border-b border-transparent focus:border-indigo-500 transition-colors"
                        />
                        <input 
                            value={c.description || ''}
                            onChange={(e) => updateCandidate(c.id, 'description', e.target.value)}
                            className="bg-transparent text-gray-400 text-sm w-full outline-none border-b border-transparent focus:border-indigo-500 transition-colors"
                            placeholder="Descrizione..."
                        />
                    </div>
                </div>

                {/* SEZIONE FATTORI STATICI (Visibile solo se ce ne sono) */}
                {staticFactors.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                        <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-3 tracking-wider">
                            Dati Tecnici (Compilati dall'Admin)
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {staticFactors.map((f: Factor) => (
                                <div key={f.id} className="bg-gray-900/50 p-2 rounded-lg border border-gray-700">
                                    <label className="text-xs text-indigo-300 font-bold block mb-1 truncate">
                                        {f.name}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number"
                                            step="0.01"
                                            value={c.static_values?.[f.id] ?? ''}
                                            onChange={(e) => updateStaticValue(c.id, f.id, Number(e.target.value))}
                                            placeholder="0"
                                            className="w-full bg-transparent font-mono text-sm outline-none text-white font-bold"
                                        />
                                        {f.trend === 'lower_better' && (
                                            <span className="text-[10px] text-red-400" title="Basso è meglio">↘</span>
                                        )}
                                        {f.trend === 'higher_better' && (
                                            <span className="text-[10px] text-green-400" title="Alto è meglio">↗</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        ))}
        
        {candidates.length === 0 && (
            <p className="text-center text-gray-500 italic py-10">
                Nessun candidato. Aggiungine uno sopra!
            </p>
        )}
      </div>
    </div>
  )
}