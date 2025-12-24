'use client'

import { useLanguage } from '@/components/providers/language-provider'
import { useState } from 'react'

export default function SettingsForm({ lobby, updateSettings }: { lobby: any, updateSettings: (s: any) => void }) {
  const { t } = useLanguage()
  
  // Stati locali
  const [privacy, setPrivacy] = useState(lobby.settings.privacy || 'private')
  const [scaleMax, setScaleMax] = useState(lobby.settings.voting_scale?.max || 10)
  const [factors, setFactors] = useState<any[]>(lobby.settings.factors || [])
  const [newFactorName, setNewFactorName] = useState('')
  const [newFactorWeight, setNewFactorWeight] = useState(1.0)

  // Aggiorna DB
  const save = (newFactors = factors, newPrivacy = privacy, newScale = scaleMax) => {
    updateSettings({
        ...lobby.settings,
        privacy: newPrivacy,
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
    // Si può cancellare solo se resta almeno un fattore
    if (factors.length <= 1) return 
    const updated = factors.filter(f => f.id !== id)
    setFactors(updated)
    save(updated)
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-10">
      
      {/* SEZIONE 1: METRICA DI VOTO (CENTRATA) */}
      <section className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 flex flex-col items-center text-center">
        <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-widest">Metrica di Voto</h3>
        
        <div className="w-full max-w-xs">
            <label className="text-sm text-gray-400 mb-2 block">Scala Massima</label>
            <select 
                value={scaleMax} 
                onChange={(e) => { setScaleMax(Number(e.target.value)); save(factors, privacy, Number(e.target.value)); }}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-base focus:ring-2 focus:ring-indigo-500 appearance-none text-center font-bold"
            >
                <option value={5}>⭐⭐⭐⭐⭐ (5 Punti)</option>
                <option value={10}>🏆 10 Punti (Standard)</option>
                <option value={100}>💯 100 Punti (Percentuale)</option>
            </select>
        </div>
      </section>

      {/* SEZIONE 2: PRIVACY */}
      <section className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800">
        <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-widest text-center">{t.lobby.privacy_label}</h3>
        <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={() => { setPrivacy('public'); save(factors, 'public'); }}
                className={`p-4 rounded-xl border text-base font-bold transition-all flex flex-col items-center gap-2 ${privacy === 'public' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
            >
                <span className="text-2xl">🌍</span>
                Pubblica
            </button>
            <button 
                onClick={() => { setPrivacy('private'); save(factors, 'private'); }}
                className={`p-4 rounded-xl border text-base font-bold transition-all flex flex-col items-center gap-2 ${privacy === 'private' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
            >
                <span className="text-2xl">🔒</span>
                Privata
            </button>
        </div>
      </section>

      {/* SEZIONE 3: FATTORI DI VOTO */}
      <section className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800">
        <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-widest text-center">{t.lobby.factors_title}</h3>
        
        {/* Input nuovo fattore */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
            <input 
                value={newFactorName}
                onChange={(e) => setNewFactorName(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl p-4 text-base outline-none focus:border-indigo-500"
                placeholder="Nuovo Criterio (es. Estetica)"
            />
            <div className="flex gap-2">
                <input 
                    type="number" step="0.1"
                    value={newFactorWeight}
                    onChange={(e) => setNewFactorWeight(Number(e.target.value))}
                    className="w-24 bg-gray-800 border border-gray-700 rounded-xl p-4 text-base text-center font-mono"
                    placeholder="x1"
                />
                <button 
                    onClick={addFactor} 
                    className="bg-indigo-600 w-14 rounded-xl font-bold hover:bg-indigo-500 text-xl shadow-lg flex items-center justify-center"
                >
                    +
                </button>
            </div>
        </div>

        {/* Lista fattori */}
        <div className="space-y-3">
            {factors.map((f) => (
                <div key={f.id} className="flex justify-between items-center bg-gray-800 p-4 rounded-xl border border-gray-700 text-base">
                    <span className="font-bold">{f.name}</span>
                    <div className="flex items-center gap-4">
                        <span className="text-xs bg-indigo-900/50 px-3 py-1 rounded-full text-indigo-300 font-mono border border-indigo-500/30">
                            PESO: {f.weight}
                        </span>
                        
                        {/* BOTTONE ELIMINA: Visibile solo se c'è più di 1 fattore */}
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
            <p className="text-xs text-center text-gray-600 mt-4 italic">Devi avere almeno un criterio di voto.</p>
        )}
      </section>
    </div>
  )
}