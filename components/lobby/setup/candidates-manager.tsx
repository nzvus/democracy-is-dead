'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/client'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { Candidate, Factor } from '@/types'
import { UI } from '@/lib/constants'

export default function CandidatesManager({ lobby }: { lobby: any }) {
  const { t } = useLanguage()
  const supabase = createClient()

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)

  const staticFactors = (lobby.settings.factors || []).filter((f: Factor) => f.type === 'static')

  useEffect(() => {
    fetchCandidates()
  }, [lobby.id])

  const fetchCandidates = async () => {
    const { data } = await supabase.from('candidates').select('*').eq('lobby_id', lobby.id).order('created_at', { ascending: true })
    if (data) setCandidates(data)
  }

  const handleImageUpload = async (file: File) => {
    try {
        setUploading(true)
        const fileExt = file.name.split('.').pop()
        const fileName = `${lobby.id}/${Math.random().toString(36).substring(2)}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('candidates').upload(fileName, file)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('candidates').getPublicUrl(fileName)
        return publicUrl
    } catch (error) {
        toast.error(t.common.error)
        return null
    } finally {
        setUploading(false)
    }
  }

  const addCandidate = async () => {
    if (!newName.trim()) return

    setLoading(true)
    let finalImageUrl = null
    if (imageFile) {
        finalImageUrl = await handleImageUpload(imageFile)
    }

    // FIX: Se descrizione è vuota, salva null, non il testo del placeholder
    const descriptionToSave = newDesc.trim().length > 0 ? newDesc : null;

    const { error } = await supabase.from('candidates').insert({
      lobby_id: lobby.id,
      name: newName,
      description: descriptionToSave,
      image_url: finalImageUrl,
      static_values: {} 
    })

    if (error) {
      toast.error(t.common.error + ": " + error.message)
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
    <div className={`space-y-8 animate-in fade-in mx-auto ${UI.LAYOUT.MAX_WIDTH_CONTAINER}`}>
      
      <div className={`${UI.COLORS.BG_CARD} ${UI.LAYOUT.PADDING_X} ${UI.LAYOUT.PADDING_Y} ${UI.LAYOUT.ROUNDED_LG} space-y-4`}>
         <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest text-center">{t.setup.add_candidate_title}</h3>
         
         <div className="space-y-3">
            <input 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t.setup.candidate_name_ph}
                className={`w-full ${UI.COLORS.BG_INPUT} ${UI.LAYOUT.ROUNDED_MD} p-4 text-base outline-none focus:border-${UI.COLORS.PRIMARY}-500`}
            />
            
            <div className="relative group">
                <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && setImageFile(e.target.files[0])}
                    className="hidden"
                    id="cand-file-upload"
                />
                <label 
                    htmlFor="cand-file-upload"
                    className={`block w-full text-center border-2 border-dashed border-gray-700 ${UI.LAYOUT.ROUNDED_MD} p-4 cursor-pointer hover:border-${UI.COLORS.PRIMARY}-500 transition-colors ${imageFile ? `bg-${UI.COLORS.PRIMARY}-900/20 border-${UI.COLORS.PRIMARY}-500 text-${UI.COLORS.PRIMARY}-300` : 'text-gray-500'}`}
                >
                    {uploading ? '...' : (imageFile ? `📸 ${imageFile.name}` : t.setup.upload_photo)}
                </label>
            </div>

            <textarea 
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder={t.setup.candidate_desc_ph}
                className={`w-full ${UI.COLORS.BG_INPUT} ${UI.LAYOUT.ROUNDED_MD} p-4 text-sm outline-none focus:border-${UI.COLORS.PRIMARY}-500 min-h-[80px] resize-none`}
            />
         </div>

         <button 
            onClick={addCandidate}
            disabled={loading || !newName.trim()}
            className={`w-full bg-${UI.COLORS.PRIMARY}-600 hover:bg-${UI.COLORS.PRIMARY}-500 disabled:opacity-50 text-white font-bold py-4 ${UI.LAYOUT.ROUNDED_MD} transition-all shadow-lg`}
         >
            {loading ? '...' : '+ ' + t.common.save}
         </button>
      </div>

      {candidates.length > 0 && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4">
            <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest text-center mt-8 mb-4">{t.setup.list_candidates} ({candidates.length})</h3>

            <div className="grid gap-4">
                {candidates.map((c) => (
                    <div key={c.id} className={`${UI.COLORS.BG_CARD} ${UI.LAYOUT.ROUNDED_MD} p-4 relative group flex flex-col gap-4`}>
                        <button onClick={() => removeCandidate(c.id)} className="absolute top-2 right-2 z-10 w-8 h-8 bg-black/50 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100">×</button>

                        <div className="flex gap-4 items-start">
                            <div className="w-20 h-20 bg-gray-800 rounded-xl overflow-hidden shrink-0 border border-gray-700">
                                {c.image_url ? <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl opacity-50">👤</div>}
                            </div>
                            
                            <div className="flex-1 space-y-2">
                                <input 
                                    value={c.name}
                                    onChange={(e) => updateCandidate(c.id, 'name', e.target.value)}
                                    className="bg-transparent font-bold text-lg w-full outline-none border-b border-transparent focus:border-indigo-500 p-0 transition-colors"
                                />
                                <textarea 
                                    value={c.description || ''}
                                    onChange={(e) => updateCandidate(c.id, 'description', e.target.value)}
                                    className="bg-transparent text-gray-400 text-xs w-full outline-none resize-none h-auto"
                                    placeholder={t.setup.candidate_desc_ph}
                                    rows={2}
                                />
                            </div>
                        </div>

                        {staticFactors.length > 0 && (
                            <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700/50 mt-2">
                                <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-wider">{t.setup.static_data_label}</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {staticFactors.map((f: Factor) => (
                                        <div key={f.id} className="relative">
                                            <label className="text-[10px] text-gray-400 block mb-1 truncate font-bold">{f.name}</label>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="number" step="0.01"
                                                    value={c.static_values?.[f.id] ?? ''}
                                                    onChange={(e) => updateStaticValue(c.id, f.id, Number(e.target.value))}
                                                    className="w-full bg-black/40 border border-gray-700 rounded px-2 py-1.5 text-sm font-mono outline-none focus:border-indigo-500 text-white"
                                                    placeholder="0"
                                                />
                                                {f.trend === 'lower_better' ? <span className="text-[10px] text-amber-500" title={t.setup.trend_low}>↘</span> : <span className="text-[10px] text-green-500" title={t.setup.trend_high}>↗</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
          </div>
      )}
    </div>
  )
}