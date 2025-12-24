'use client'

import { useLanguage } from '@/components/providers/language-provider'
import { useState } from 'react'
import { Factor, Trend, FactorType } from '@/types' 
import { createClient } from '@/lib/client'
import { toast } from 'sonner'
import { UI } from '@/lib/constants'

export default function SettingsForm({ lobby, updateSettings }: { lobby: any, updateSettings: (s: any) => void }) {
  const { t } = useLanguage()
  const supabase = createClient()
  
  // Stati Configurazione
  const [privacy, setPrivacy] = useState(lobby.settings.privacy || 'private')
  const [scaleMax, setScaleMax] = useState(lobby.settings.voting_scale?.max || 10)
  const [allowDecimals, setAllowDecimals] = useState(lobby.settings.allow_decimals || false)
  const [factors, setFactors] = useState<Factor[]>(lobby.settings.factors || [])

  // Stati Input Nuovo Fattore
  const [newName, setNewName] = useState('')
  const [newWeight, setNewWeight] = useState(1.0)
  const [newType, setNewType] = useState<FactorType>('vote')
  const [newTrend, setNewTrend] = useState<Trend>('higher_better')
  const [factorImage, setFactorImage] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const save = (updatedFactors = factors, p = privacy, s = scaleMax, d = allowDecimals) => {
    updateSettings({
        ...lobby.settings,
        privacy: p,
        allow_decimals: d,
        voting_scale: { ...lobby.settings.voting_scale, max: s },
        factors: updatedFactors
    })
  }

  // Upload Immagine Fattore (Bucket: 'factors')
  const handleUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const filePath = `${lobby.id}/${Math.random().toString(36).substring(2)}.${fileExt}`
    
    // Assicurati che il bucket 'factors' esista su Supabase (Public)
    const { error } = await supabase.storage.from('factors').upload(filePath, file)
    if (error) {
        console.error("Upload error:", error)
        return null
    }
    
    const { data } = supabase.storage.from('factors').getPublicUrl(filePath)
    return data.publicUrl
  }

  const addFactor = async () => {
    if (!newName.trim()) return
    
    let imgUrl = null
    if (factorImage) {
        setUploading(true)
        imgUrl = await handleUpload(factorImage)
        setUploading(false)
        if (!imgUrl) toast.error(t.common.error)
    }

    const newFactor: Factor = {
        id: Math.random().toString(36).substr(2, 9),
        name: newName,
        weight: newWeight,
        type: newType,
        trend: newTrend,
        image_url: imgUrl
    }
    
    const updated = [...factors, newFactor]
    setFactors(updated)
    
    // Reset form
    setNewName('')
    setFactorImage(null)
    setNewWeight(1.0)
    save(updated)
  }

  const removeFactor = (id: string) => {
    if (factors.length <= 1) return 
    const updated = factors.filter(f => f.id !== id)
    setFactors(updated)
    save(updated)
  }

  return (
    <div className={`space-y-6 animate-in fade-in pb-10 mx-auto ${UI.LAYOUT.MAX_WIDTH_CONTAINER}`}>
      
      {/* 1. SCALA & OPZIONI */}
      <section className={`${UI.COLORS.BG_CARD} ${UI.LAYOUT.PADDING_X} ${UI.LAYOUT.PADDING_Y} ${UI.LAYOUT.ROUNDED_LG} space-y-4`}>
        <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest text-center">{t.setup.section_metrics}</h3>
        
        <div className="flex gap-4 items-center justify-center">
            <select 
                value={scaleMax} 
                onChange={(e) => { setScaleMax(Number(e.target.value)); save(factors, privacy, Number(e.target.value), allowDecimals); }}
                className={`flex-1 ${UI.COLORS.BG_INPUT} ${UI.LAYOUT.ROUNDED_MD} p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-${UI.COLORS.PRIMARY}-500`}
            >
                <option value={5}>{t.setup.scale_5}</option>
                <option value={10}>{t.setup.scale_10}</option>
                <option value={100}>{t.setup.scale_100}</option>
            </select>
            
            <button 
                onClick={() => { setAllowDecimals(!allowDecimals); save(factors, privacy, scaleMax, !allowDecimals); }}
                className={`flex-1 ${UI.LAYOUT.ROUNDED_MD} font-bold text-xs py-3 transition-all border ${allowDecimals ? `bg-${UI.COLORS.PRIMARY}-600 border-${UI.COLORS.PRIMARY}-500 text-white` : 'bg-gray-800 border-gray-700 text-gray-400'}`}
            >
                {t.setup.decimals_label}: {allowDecimals ? 'ON' : 'OFF'}
            </button>
        </div>
      </section>

      {/* 2. GESTIONE FATTORI */}
      <section className={`${UI.COLORS.BG_CARD} ${UI.LAYOUT.PADDING_X} ${UI.LAYOUT.PADDING_Y} ${UI.LAYOUT.ROUNDED_LG}`}>
        <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-widest text-center">{t.setup.section_factors}</h3>
        
        {/* INPUT BOX */}
        <div className={`bg-black/20 p-4 ${UI.LAYOUT.ROUNDED_MD} border border-gray-700/50 mb-6 space-y-4`}>
            
            {/* Nome e Immagine */}
            <div className="flex gap-2">
                 <input 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className={`flex-1 ${UI.COLORS.BG_INPUT} ${UI.LAYOUT.ROUNDED_MD} p-3 text-sm outline-none focus:border-${UI.COLORS.PRIMARY}-500 placeholder:text-gray-600`}
                    placeholder={t.setup.factor_placeholder}
                />
                <label className={`cursor-pointer w-12 h-12 flex shrink-0 items-center justify-center border border-gray-700 bg-gray-800 hover:bg-gray-700 ${UI.LAYOUT.ROUNDED_MD} transition-colors overflow-hidden`}>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && setFactorImage(e.target.files[0])} />
                    {factorImage ? (
                        <img src={URL.createObjectURL(factorImage)} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xl">📸</span>
                    )}
                </label>
            </div>

            {/* Configurazione Tipo e Trend */}
            <div className="grid grid-cols-2 gap-3">
                 {/* Tipo: Voto vs Dati */}
                 <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-700">
                    <button onClick={() => setNewType('vote')} className={`flex-1 rounded-lg text-[10px] md:text-xs font-bold py-2 transition-all ${newType === 'vote' ? `bg-${UI.COLORS.PRIMARY}-600 text-white` : 'text-gray-500'}`}>
                        {t.setup.factor_type_vote}
                    </button>
                    <button onClick={() => setNewType('static')} className={`flex-1 rounded-lg text-[10px] md:text-xs font-bold py-2 transition-all ${newType === 'static' ? 'bg-amber-600 text-white' : 'text-gray-500'}`}>
                        {t.setup.factor_type_static}
                    </button>
                 </div>

                 {/* Trend: Alto vs Basso */}
                 <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-700">
                    <button onClick={() => setNewTrend('higher_better')} className={`flex-1 rounded-lg text-[10px] md:text-xs font-bold py-2 transition-all ${newTrend === 'higher_better' ? UI.COLORS.TREND_HIGH : 'text-gray-500'}`}>
                        ↗ {t.setup.trend_high.split(' ')[0]}
                    </button>
                    <button onClick={() => setNewTrend('lower_better')} className={`flex-1 rounded-lg text-[10px] md:text-xs font-bold py-2 transition-all ${newTrend === 'lower_better' ? UI.COLORS.TREND_LOW : 'text-gray-500'}`}>
                        ↘ {t.setup.trend_low.split(' ')[0]}
                    </button>
                 </div>
            </div>

            {/* Peso */}
            <div className="flex gap-3 items-center">
                <div className="flex items-center gap-3 bg-gray-900 px-4 py-2 rounded-xl border border-gray-700 flex-1 relative">
                    <span className="text-[10px] text-gray-500 font-bold uppercase whitespace-nowrap">{t.setup.weight_label}:</span>
                    <input 
                        type="number" step="0.1"
                        value={newWeight}
                        onChange={(e) => setNewWeight(Number(e.target.value))}
                        className="w-full bg-transparent text-lg font-mono text-center outline-none" 
                    />
                </div>
                <button 
                    onClick={addFactor} 
                    disabled={uploading}
                    className={`bg-${UI.COLORS.PRIMARY}-600 w-14 h-12 rounded-xl font-bold hover:bg-${UI.COLORS.PRIMARY}-500 shadow-lg text-2xl flex items-center justify-center transition-transform active:scale-95`}
                >
                    {uploading ? <span className="text-xs">...</span> : "+"}
                </button>
            </div>
        </div>

        {/* LISTA FATTORI */}
        <div className="space-y-3">
            {factors.map((f) => (
                <div key={f.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-xl border border-gray-700 animate-in slide-in-from-left-2">
                    <div className="flex items-center gap-3">
                        {/* Icona Fattore */}
                        <div className="w-10 h-10 rounded-lg bg-gray-900 border border-gray-700 overflow-hidden flex items-center justify-center shrink-0">
                            {f.image_url ? (
                                <img src={f.image_url} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs text-gray-600">No IMG</span>
                            )}
                        </div>
                        
                        <div className="flex flex-col">
                            <span className="font-bold text-sm flex items-center gap-2">
                                {f.name}
                                {f.type === 'static' && <span className="text-[9px] bg-amber-900/50 text-amber-200 px-1.5 py-0.5 rounded border border-amber-800">DATA</span>}
                            </span>
                            
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-400 bg-black/30 px-1.5 rounded font-mono">x{f.weight}</span>
                                {f.trend === 'lower_better' ? (
                                    <span className={`text-[9px] px-1 rounded border ${UI.COLORS.TREND_LOW}`}>LOW ↘</span>
                                ) : (
                                    <span className={`text-[9px] px-1 rounded border ${UI.COLORS.TREND_HIGH}`}>HIGH ↗</span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => removeFactor(f.id)} 
                        disabled={factors.length <= 1}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-red-900/30 hover:text-red-400 transition-colors"
                        title={t.common.delete}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
      </section>
      
      {/* 3. PRIVACY */}
      <section className={`${UI.COLORS.BG_CARD} ${UI.LAYOUT.PADDING_X} ${UI.LAYOUT.PADDING_Y} ${UI.LAYOUT.ROUNDED_LG}`}>
        <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-widest text-center">{t.setup.section_privacy}</h3>
        <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={() => { setPrivacy('public'); save(factors, 'public'); }}
                className={`p-4 ${UI.LAYOUT.ROUNDED_MD} border text-sm font-bold transition-all flex flex-col items-center gap-2 ${privacy === 'public' ? `bg-${UI.COLORS.PRIMARY}-600 border-${UI.COLORS.PRIMARY}-500 text-white` : 'bg-gray-800 border-gray-700 text-gray-400'}`}
            >
                <span className="text-xl">🌍</span>
                {t.setup.privacy_public}
            </button>
            <button 
                onClick={() => { setPrivacy('private'); save(factors, 'private'); }}
                className={`p-4 ${UI.LAYOUT.ROUNDED_MD} border text-sm font-bold transition-all flex flex-col items-center gap-2 ${privacy === 'private' ? `bg-${UI.COLORS.PRIMARY}-600 border-${UI.COLORS.PRIMARY}-500 text-white` : 'bg-gray-800 border-gray-700 text-gray-400'}`}
            >
                <span className="text-xl">🔒</span>
                {t.setup.privacy_private}
            </button>
        </div>
      </section>
    </div>
  )
}