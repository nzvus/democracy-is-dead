'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'

type Factor = { id: string; name: string; weight: number }
type Candidate = { id: string; name: string; description: string; image_url: string | null }

export default function LobbySetup({ lobby, userId }: { lobby: any, userId: string }) {
  const { t } = useLanguage()
  const supabase = createClient()
  
  const [activeTab, setActiveTab] = useState<'candidates' | 'settings'>('candidates')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const [privacy, setPrivacy] = useState(lobby.settings.privacy || 'private')
  const [factors, setFactors] = useState<Factor[]>(lobby.settings.factors || [])
  const [newFactorName, setNewFactorName] = useState('')
  const [newFactorWeight, setNewFactorWeight] = useState(1)

  useEffect(() => {
    const fetchCandidates = async () => {
      const { data } = await supabase.from('candidates').select('*').eq('lobby_id', lobby.id)
      if (data) setCandidates(data)
    }
    fetchCandidates()
  }, [lobby.id, supabase])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setUploading(true)
    const file = e.target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${lobby.code}/${fileName}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('candidates')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('candidates').getPublicUrl(filePath)
      setImageUrl(data.publicUrl)
      toast.success("Foto caricata!")
    } catch (error: any) {
      toast.error("Errore upload: " + error.message)
    } finally {
      setUploading(false)
    }
  }

  const addCandidate = async () => {
    if (!newName.trim()) return
    const { data, error } = await supabase
      .from('candidates')
      .insert([{ 
        lobby_id: lobby.id, 
        name: newName, 
        description: newDesc,
        image_url: imageUrl,
        attributes: {} 
      }])
      .select().single()

    if (error) toast.error(error.message)
    else {
      setCandidates([...candidates, data])
      setNewName(''); setNewDesc(''); setImageUrl(null);
      toast.success("Candidato aggiunto!")
    }
  }

  const addFactor = async () => {
    if (!newFactorName.trim()) return
    const newFactor = { 
        id: Math.random().toString(36).substr(2, 9), 
        name: newFactorName, 
        weight: Number(newFactorWeight) 
    }
    const updatedFactors = [...factors, newFactor]
    
    await updateSettingsInDB(updatedFactors, privacy)
    
    setFactors(updatedFactors)
    setNewFactorName('')
  }

  const removeFactor = async (id: string) => {
      const updated = factors.filter(f => f.id !== id)
      setFactors(updated)
      await updateSettingsInDB(updated, privacy)
  }

  const updateSettingsInDB = async (currentFactors: Factor[], currentPrivacy: string) => {
      const newSettings = {
          ...lobby.settings,
          privacy: currentPrivacy,
          factors: currentFactors
      }
      const { error } = await supabase
        .from('lobbies')
        .update({ settings: newSettings })
        .eq('id', lobby.id)
      
      if (error) toast.error("Errore salvataggio impostazioni")
  }

  const startElection = async () => {
    if (candidates.length < 2) return toast.error("Serve almeno un duello (2 candidati)!")
    await supabase.from('lobbies').update({ status: 'voting' }).eq('id', lobby.id)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <header className="flex flex-col md:flex-row justify-between items-center border-b border-gray-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              {t.lobby.setup_title}: {lobby.code}
            </h1>
          </div>
          <button
                onClick={startElection}
                className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-900/20 transition-all hover:scale-105"
            >
                {t.lobby.start_btn}
            </button>
        </header>

        <div className="flex gap-4 border-b border-gray-800">
            <button 
                onClick={() => setActiveTab('candidates')}
                className={`pb-3 px-4 font-bold transition-all ${activeTab === 'candidates' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500'}`}
            >
                🍕 {t.lobby.tabs_candidates}
            </button>
            <button 
                onClick={() => setActiveTab('settings')}
                className={`pb-3 px-4 font-bold transition-all ${activeTab === 'settings' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500'}`}
            >
                ⚙️ {t.lobby.tabs_settings}
            </button>
        </div>

        {activeTab === 'candidates' && (
            <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 space-y-4 h-fit">
                    <h2 className="font-bold text-lg">{t.lobby.add_candidate}</h2>
                    
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center">
                            {imageUrl ? (
                                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl">📷</span>
                            )}
                        </div>
                        <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-bold border border-gray-600 transition-all">
                            {uploading ? t.lobby.uploading : t.lobby.upload_photo}
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                    </div>

                    <input 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 outline-none focus:border-indigo-500"
                        placeholder={t.lobby.candidate_name_ph}
                    />
                    <textarea 
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 outline-none focus:border-indigo-500 h-20"
                        placeholder={t.lobby.candidate_desc_ph}
                    />
                    <button onClick={addCandidate} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold">
                        ➕ {t.lobby.add_candidate}
                    </button>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {candidates.map((c) => (
                        <div key={c.id} className="flex gap-4 p-4 bg-gray-800 rounded-xl border border-gray-700 items-center">
                            <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                                {c.image_url ? <img src={c.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">🍕</div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold truncate">{c.name}</h3>
                                <p className="text-xs text-gray-400 truncate">{c.description}</p>
                            </div>
                            <button 
                                onClick={async () => {
                                    await supabase.from('candidates').delete().eq('id', c.id)
                                    setCandidates(candidates.filter(i => i.id !== c.id))
                                }}
                                className="text-red-400 hover:bg-red-900/20 p-2 rounded-lg"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'settings' && (
            <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 space-y-6">
                    <div>
                        <h2 className="font-bold text-lg mb-4">{t.lobby.factors_title}</h2>
                        <div className="flex gap-2 mb-4">
                            <input 
                                value={newFactorName}
                                onChange={(e) => setNewFactorName(e.target.value)}
                                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-2 outline-none"
                                placeholder={t.lobby.factor_name_ph}
                            />
                            <input 
                                type="number" min="1" max="10"
                                value={newFactorWeight}
                                onChange={(e) => setNewFactorWeight(Number(e.target.value))}
                                className="w-20 bg-gray-800 border border-gray-700 rounded-lg p-2 outline-none text-center"
                                placeholder="Weight"
                            />
                            <button onClick={addFactor} className="bg-indigo-600 px-4 rounded-lg font-bold hover:bg-indigo-500">+</button>
                        </div>
                        
                        <div className="space-y-2">
                            {factors.map((f) => (
                                <div key={f.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg border border-gray-700">
                                    <span className="font-bold">{f.name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs bg-indigo-900 px-2 py-1 rounded text-indigo-300">x{f.weight}</span>
                                        {f.id !== 'general' && ( 
                                            <button onClick={() => removeFactor(f.id)} className="text-red-400 hover:text-red-300">×</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 space-y-6 h-fit">
                    <h2 className="font-bold text-lg">{t.lobby.privacy_label}</h2>
                    <div className="space-y-3">
                        <button 
                            onClick={() => { setPrivacy('public'); updateSettingsInDB(factors, 'public'); }}
                            className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${privacy === 'public' ? 'bg-indigo-900/20 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                        >
                            <span>🌍 {t.lobby.privacy_public}</span>
                            {privacy === 'public' && <span>✅</span>}
                        </button>
                        <button 
                            onClick={() => { setPrivacy('private'); updateSettingsInDB(factors, 'private'); }}
                            className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${privacy === 'private' ? 'bg-indigo-900/20 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                        >
                            <span>🔒 {t.lobby.privacy_private}</span>
                            {privacy === 'private' && <span>✅</span>}
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  )
}