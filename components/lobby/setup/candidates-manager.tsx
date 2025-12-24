'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'

export default function CandidatesManager({ lobby }: { lobby: any }) {
  const { t } = useLanguage()
  const supabase = createClient()
  const [candidates, setCandidates] = useState<any[]>([])
  const [newName, setNewName] = useState('')
  const [uploading, setUploading] = useState(false)

  // Carica
  useEffect(() => {
    const fetch = async () => {
        const { data } = await supabase.from('candidates').select('*').eq('lobby_id', lobby.id)
        if(data) setCandidates(data)
    }
    fetch()
  }, [lobby.id])

  // Aggiungi
  const add = async () => {
    if (!newName.trim()) return
    const { data, error } = await supabase
      .from('candidates')
      .insert([{ lobby_id: lobby.id, name: newName, attributes: {} }]) // Niente descrizione obbligatoria per velocità
      .select().single()

    if (error) toast.error(error.message)
    else {
        setCandidates([...candidates, data])
        setNewName('')
    }
  }

  // Upload Foto Rapido
  const handlePhoto = async (file: File, candidateId: string) => {
    setUploading(true)
    const filePath = `${lobby.code}/${candidateId}-${Math.random()}`
    await supabase.storage.from('candidates').upload(filePath, file)
    const { data } = supabase.storage.from('candidates').getPublicUrl(filePath)
    
    // Aggiorna DB
    await supabase.from('candidates').update({ image_url: data.publicUrl }).eq('id', candidateId)
    
    // Aggiorna UI locale
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, image_url: data.publicUrl } : c))
    setUploading(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
        
        {/* Input Rapido */}
        <div className="flex gap-2">
            <input 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && add()}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl p-4 text-base outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={t.setup.add_placeholder}
            />
            <button onClick={add} className="bg-indigo-600 px-6 rounded-xl font-bold hover:bg-indigo-500 shadow-lg">
                ↵
            </button>
        </div>

        {/* Lista Griglia */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {candidates.map(c => (
                <div key={c.id} className="relative group bg-gray-800 rounded-xl p-3 border border-gray-700 flex flex-col items-center gap-2">
                    {/* Foto */}
                    <label className={`w-16 h-16 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-indigo-500 transition-all ${uploading ? 'opacity-50' : ''}`}>
                        {c.image_url ? <img src={c.image_url} className="w-full h-full object-cover" /> : <span className="text-2xl text-gray-500">📷</span>}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handlePhoto(e.target.files[0], c.id)} />
                    </label>
                    
                    <span className="font-bold text-sm text-center truncate w-full">{c.name}</span>
                    
                    <button 
                        onClick={async () => {
                            await supabase.from('candidates').delete().eq('id', c.id)
                            setCandidates(candidates.filter(i => i.id !== c.id))
                        }}
                        className="absolute top-1 right-1 text-gray-500 hover:text-red-400 p-1"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    </div>
  )
}