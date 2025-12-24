'use client'

import { useLanguage } from '@/components/providers/language-provider'
import { useState } from 'react'

export default function SettingsForm({ lobby, updateSettings }: { lobby: any, updateSettings: (s: any) => void }) {
  const { t } = useLanguage()
  
  // Stati locali per i nuovi input
  const [privacy, setPrivacy] = useState(lobby.settings.privacy || 'private')
  const [scaleMax, setScaleMax] = useState(lobby.settings.voting_scale?.max || 10)
  const [factors, setFactors] = useState<any[]>(lobby.settings.factors || [])
  const [newFactorName, setNewFactorName] = useState('')
  const [newFactorWeight, setNewFactorWeight] = useState(1.0)

  // Aggiorna il DB
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
    const updated = factors.filter(f => f.id !== id)
    setFactors(updated)
    save(updated)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      
      {/* SEZIONE 1: SCALA DI VOTO */}
      <section className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800">
        <h3 className="text-sm font-bold uppercase text-gray-500 mb-4 tracking-wider">Metrica di Voto</h3>
        <div className="flex items-center gap-4">
            <label className="text-sm">Voto Massimo:</label>
            <select 
                value={scaleMax} 
                onChange={(e) => { setScaleMax(Number(e.target.value)); save(factors, privacy, Number(e.target.value)); }}
                className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
            >
                <option value={5}>5 (Stelle)</option>
                <option value={10}>10 (Standard)</option>
                <option value={100}>100 (Percentuale)</option>
            </select>
        </div>
      </section>

      {/* SEZIONE 2: PRIVACY */}
      <section className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800">
        <h3 className="text-sm font-bold uppercase text-gray-500 mb-4 tracking-wider">{t.lobby.privacy_label}</h3>
        <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={() => { setPrivacy('public'); save(factors, 'public'); }}
                className={`p-3 rounded-xl border text-sm font-bold transition-all ${privacy === 'public' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
            >
                🌍 Pubblica
            </button>
            <button 
                onClick={() => { setPrivacy('private'); save(factors, 'private'); }}
                className={`p-3 rounded-xl border text-sm font-bold transition-all ${privacy === 'private' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
            >
                🔒 Privata
            </button>
        </div>
      </section>

      {/* SEZIONE 3: FATTORI DI VOTO */}
      <section className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800">
        <h3 className="text-sm font-bold uppercase text-gray-500 mb-4 tracking-wider">{t.lobby.factors_title}</h3>
        
        {/* Input nuovo fattore */}
        <div className="flex gap-2 mb-4">
            <input 
                value={newFactorName}
                onChange={(e) => setNewFactorName(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm outline-none focus:border-indigo-500"
                placeholder="Es. Estetica, Velocità..."
            />
            <input 
                type="number" step="0.1"
                value={newFactorWeight}
                onChange={(e) => setNewFactorWeight(Number(e.target.value))}
                className="w-16 bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-center"
                placeholder="x1"
            />
            <button onClick={addFactor} className="bg-indigo-600 px-3 rounded-lg font-bold hover:bg-indigo-500">+</button>
        </div>

        {/* Lista fattori */}
        <div className="space-y-2">
            {factors.map((f) => (
                <div key={f.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg border border-gray-700 text-sm">
                    <span className="font-medium">{f.name}</span>
                    <div className="flex items-center gap-3">
                        <span className="text-xs bg-indigo-900/50 px-2 py-1 rounded text-indigo-300 font-mono">x{f.weight}</span>
                        {f.id !== 'general' && (
                            <button onClick={() => removeFactor(f.id)} className="text-gray-500 hover:text-red-400">×</button>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </section>
    </div>
  )
}