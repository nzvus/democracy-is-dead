'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/client'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { Candidate, Factor } from '@/types'

export default function CandidatesManager({ lobby }: { lobby: any }) {
  const { t } = useLanguage()
  const supabase = createClient()

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Input form
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)

  const staticFactors = (lobby.settings.factors || []).filter((f: Factor) => f.type === 'static')

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

  // UPLOAD IMMAGINE
  const handleImageUpload = async (file: File) => {
    try {
        setUploading(true)
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${lobby.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('candidates')
            .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
            .from('candidates')
            .getPublicUrl(filePath)

        return publicUrl
    } catch (error) {
        toast.error("Errore caricamento immagine")
        return null
    } finally {
        setUploading(false)
    }
  }

  // AGGIUNTA CANDIDATO
  const addCandidate = async () => {
    if (!newName.trim()) return toast.error(t.common.error)

    setLoading(true)
    let finalImageUrl = null

    if (imageFile) {
        finalImageUrl = await handleImageUpload(imageFile)
    }

    // Assicuriamoci che static_values sia un oggetto valido
    const { error } = await supabase.from('candidates').insert({
      lobby_id: lobby.id,
      name: newName,
      description: newDesc,
      image_url: finalImageUrl,
      static_values: {} 
    })

    if (error) {
      console.error(error)
      toast.error("Database Error: " + error.message)
    } else {
      setNewName('')
      setNewDesc('')
      setImageFile(null)
      fetchCandidates()
      toast.success(t.common.save)
    }
    setLoading(false)
  }

  const removeCandidate = async (id: string) => {
    const { error } = await supabase.from('candidates').delete().eq('id', id)
    if (!error) setCandidates(candidates.filter(c => c.id !== id))
  }

  const updateCandidate = async (id: string, field: string, value: any) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
    await supabase.from('candidates').update({ [field]: value }).eq('id', id)
  }

  const updateStaticValue = async (candidateId: string, factorId: string, value: number) => {
    const candidate = candidates.find(c => c.id === candidateId)
    if (!candidate) return

    const newStaticValues = { ...(candidate.static_values || {}), [factorId]: value }
    
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, static_values: newStaticValues } : c))
    await supabase.from('candidates').update({ static_values: newStaticValues }).eq('id', candidateId)
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* FORM AGGIUNTA */}
      <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 space-y-4 max-w-xl mx-auto">
         <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest text-center">
            {t.setup.add_candidate_title}
         </h3>
         
         <div className="space-y-3">
            <input 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t.setup.candidate_name_ph}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-base outline-none focus:border-indigo-500"
            />
            
            {/* FILE INPUT REALE */}
            <div className="relative group">
                <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && setImageFile(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                />
                <label 
                    htmlFor="file-upload"
                    className={`block w-full text-center border-2 border-dashed border-gray-700 rounded-xl p-4 cursor-pointer hover:border-indigo-500 transition-colors ${imageFile ? 'bg-indigo-900/20 border-indigo-500 text-indigo-300' : 'text-gray-500'}`}
                >
                    {uploading ? 'Caricamento...' : (imageFile ? `📸 ${imageFile.name}` : t.setup.upload_photo)}
                </label>
            </div>

            <textarea 
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder={t.setup.candidate_desc_ph}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm outline-none focus:border-indigo-500 min-h-[80px]"
            />
         </div>

         <button 
            onClick={addCandidate}
            disabled={loading || !newName.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
         >
            {loading ? '...' : '+ ' + t.common.save}
         </button>
      </div>

      {/* LISTA */}
      <div className="grid md:grid-cols-2 gap-4">
        {candidates.map((c) => (
            <div key={c.id} className="bg-gray-800 rounded-2xl p-4 border border-gray-700 relative group flex flex-col gap-4">
                
                <button 
                    onClick={() => removeCandidate(c.id)}
                    className="absolute top-2 right-2 z-10 w-8 h-8 bg-black/50 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-all"
                >
                    ×
                </button>

                <div className="flex gap-4 items-start">
                    <div className="w-20 h-20 bg-gray-700 rounded-xl overflow-hidden shrink-0">
                        {c.image_url ? (
                            <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
                        )}
                    </div>
                    <div className="flex-1 space-y-2">
                        <input 
                            value={c.name}
                            onChange={(e) => updateCandidate(c.id, 'name', e.target.value)}
                            className="bg-transparent font-bold text-lg w-full outline-none border-b border-transparent focus:border-indigo-500 p-0"
                        />
                        <textarea 
                            value={c.description || ''}
                            onChange={(e) => updateCandidate(c.id, 'description', e.target.value)}
                            className="bg-transparent text-gray-400 text-xs w-full outline-none resize-none h-12"
                            placeholder={t.setup.candidate_desc_ph}
                        />
                    </div>
                </div>

                {staticFactors.length > 0 && (
                    <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700/50">
                        <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2">{t.setup.static_data_label}</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {staticFactors.map((f: Factor) => (
                                <div key={f.id}>
                                    <label className="text-[10px] text-indigo-300 block mb-0.5 truncate">{f.name}</label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        value={c.static_values?.[f.id] ?? ''}
                                        onChange={(e) => updateStaticValue(c.id, f.id, Number(e.target.value))}
                                        className="w-full bg-gray-800 rounded px-2 py-1 text-xs font-mono outline-none focus:ring-1 ring-indigo-500"
                                        placeholder="0"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        ))}
      </div>
    </div>
  )
}