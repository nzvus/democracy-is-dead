'use client'

import { useLanguage } from '@/components/providers/language-provider'
import { useState } from 'react'

export default function SettingsForm({ lobby, updateSettings }: { lobby: any, updateSettings: (s: any) => void }) {
  const { t } = useLanguage()
  
  const [privacy, setPrivacy] = useState(lobby.settings.privacy || 'private')
  const [scaleMax, setScaleMax] = useState(lobby.settings.voting_scale?.max || 10)
  // NUOVO STATO
  const [allowDecimals, setAllowDecimals] = useState(lobby.settings.allow_decimals || false)
  
  const [factors, setFactors] = useState<any[]>(lobby.settings.factors || [])
  const [newFactorName, setNewFactorName] = useState('')
  const [newFactorWeight, setNewFactorWeight] = useState(1.0)

  const save = (newFactors = factors, newPrivacy = privacy, newScale = scaleMax, decimals = allowDecimals) => {
    updateSettings({
        ...lobby.settings,
        privacy: newPrivacy,
        allow_decimals: decimals, // SALVATAGGIO OPZIONE
        voting_scale: { ...lobby.settings.voting_scale, max: newScale },
        factors: newFactors
    })
  }

  const addFactor = () => {
    if (!newFactorName.trim()) return
    const updated = [...factors, { id: Math.random().toString(36).substr(2, 9), name: newFactorName, weight: newFactorWeight }]
    setFactors(updated)
    setNewFactorName('')
    save(updated)
  }

  const removeFactor = (id: string) => {
    if (factors.length <= 1) return 
    const updated = factors.filter(f => f.id !== id)
    setFactors(updated)
    save(updated)
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-10">
      
      {/* SEZIONE 1: SCALA E OPZIONI */}
      <section className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 flex flex-col items-center text-center">
        <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-widest">{t.setup.section_metrics}</h3>
        
        <div className="w-full max-w-xs space-y-4">
            <div>
                <label className="text-sm text-gray-400 mb-2 block">{t.setup.scale_label}</label>
                <select 
                    value={scaleMax} 
                    onChange={(e) => { setScaleMax(Number(e.target.value)); save(factors, privacy, Number(e.target.value), allowDecimals); }}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-base focus:ring-2 focus:ring-indigo-500 appearance-none text-center font-bold"
                >
                    <option value={5}>{t.setup.scale_5}</option>
                    <option value={10}>{t.setup.scale_10}</option>
                    <option value={100}>{t.setup.scale_100}</option>
                </select>
            </div>

            {/* TOGGLE DECIMALI */}
            <div className="flex items-center justify-between bg-gray-800 p-4 rounded-xl border border-gray-700">
                <span className="font-bold text-gray-300 text-sm">Usa Decimali (es. 7.5)</span>
                <button 
                    onClick={() => { setAllowDecimals(!allowDecimals); save(factors, privacy, scaleMax, !allowDecimals); }}
                    className={`w-14 h-8 rounded-full transition-colors relative ${allowDecimals ? 'bg-indigo-600' : 'bg-gray-600'}`}
                >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow-sm ${allowDecimals ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
            </div>
        </div>
      </section>

      {/* SEZIONE 2: PRIVACY (Invariata) */}
      <section className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800">
        <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-widest text-center">{t.setup.section_privacy}</h3>
        <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={() => { setPrivacy('public'); save(factors, 'public'); }}
                className={`p-4 rounded-xl border text-base font-bold transition-all flex flex-col items-center gap-2 ${privacy === 'public' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
            >
                <span className="text-2xl">🌍</span>
                {t.setup.privacy_public}
            </button>
            <button 
                onClick={() => { setPrivacy('private'); save(factors, 'private'); }}
                className={`p-4 rounded-xl border text-base font-bold transition-all flex flex-col items-center gap-2 ${privacy === 'private' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
            >
                <span className="text-2xl">🔒</span>
                {t.setup.privacy_private}
            </button>
        </div>
      </section>

      {/* SEZIONE 3: FATTORI (Invariata) */}
      <section className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800">
        <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-widest text-center">{t.setup.section_factors}</h3>
        
        <div className="flex flex-col md:flex-row gap-3 mb-6">
            <input 
                value={newFactorName}
                onChange={(e) => setNewFactorName(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl p-4 text-base outline-none focus:border-indigo-500"
                placeholder={t.setup.factor_placeholder}
            />
            <div className="flex gap-2">
                <input 
                    type="number" step="0.1"
                    value={newFactorWeight}
                    onChange={(e) => setNewFactorWeight(Number(e.target.value))}
                    className="w-24 bg-gray-800 border border-gray-700 rounded-xl p-4 text-base text-center font-mono"
                    placeholder={t.setup.factor_weight_ph}
                />
                <button 
                    onClick={addFactor} 
                    className="bg-indigo-600 w-14 rounded-xl font-bold hover:bg-indigo-500 text-xl shadow-lg flex items-center justify-center"
                >
                    +
                </button>
            </div>
        </div>

        <div className="space-y-3">
            {factors.map((f) => (
                <div key={f.id} className="flex justify-between items-center bg-gray-800 p-4 rounded-xl border border-gray-700 text-base">
                    <span className="font-bold">{f.name}</span>
                    <div className="flex items-center gap-4">
                        <span className="text-xs bg-indigo-900/50 px-3 py-1 rounded-full text-indigo-300 font-mono border border-indigo-500/30">
                            x{f.weight}
                        </span>
                        
                        <button 
                            onClick={() => removeFactor(f.id)} 
                            disabled={factors.length <= 1}
                            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${factors.length <= 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-red-900/30 hover:text-red-400'}`}
                        >
                            ×
                        </button>
                    </div>
                </div>
            ))}
        </div>
        
        {factors.length <= 1 && (
            <p className="text-xs text-center text-gray-600 mt-4 italic">{t.setup.min_factor_error}</p>
        )}
      </section>
    </div>
  )
}