'use client'

import { useLanguage } from '@/components/providers/language-provider'
import { useState } from 'react'
import { Factor, Trend, FactorType } from '@/types' 

export default function SettingsForm({ lobby, updateSettings }: { lobby: any, updateSettings: (s: any) => void }) {
  const { t } = useLanguage()
  
  const [privacy, setPrivacy] = useState(lobby.settings.privacy || 'private')
  const [scaleMax, setScaleMax] = useState(lobby.settings.voting_scale?.max || 10)
  const [allowDecimals, setAllowDecimals] = useState(lobby.settings.allow_decimals || false)
  const [factors, setFactors] = useState<Factor[]>(lobby.settings.factors || [])

  // Input States
  const [newName, setNewName] = useState('')
  const [newWeight, setNewWeight] = useState(1.0)
  const [newType, setNewType] = useState<FactorType>('vote')
  const [newTrend, setNewTrend] = useState<Trend>('higher_better')

  const save = (updatedFactors = factors, p = privacy, s = scaleMax, d = allowDecimals) => {
    updateSettings({
        ...lobby.settings,
        privacy: p,
        allow_decimals: d,
        voting_scale: { ...lobby.settings.voting_scale, max: s },
        factors: updatedFactors
    })
  }

  const addFactor = () => {
    if (!newName.trim()) return
    const newFactor: Factor = {
        id: Math.random().toString(36).substr(2, 9),
        name: newName,
        weight: newWeight,
        type: newType,
        trend: newTrend
    }
    const updated = [...factors, newFactor]
    setFactors(updated)
    setNewName('')
    save(updated)
  }

  const removeFactor = (id: string) => {
    if (factors.length <= 1) return 
    const updated = factors.filter(f => f.id !== id)
    setFactors(updated)
    save(updated)
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-10 max-w-xl mx-auto"> {/* Centrato con mx-auto */}
      
      {/* 1. SCALA & OPZIONI */}
      <section className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 space-y-4">
        <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest text-center">{t.setup.section_metrics}</h3>
        
        <div className="flex gap-4 items-center justify-center">
            <select 
                value={scaleMax} 
                onChange={(e) => { setScaleMax(Number(e.target.value)); save(factors, privacy, Number(e.target.value), allowDecimals); }}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <option value={5}>{t.setup.scale_5}</option>
                <option value={10}>{t.setup.scale_10}</option>
                <option value={100}>{t.setup.scale_100}</option>
            </select>
            
            <button 
                onClick={() => { setAllowDecimals(!allowDecimals); save(factors, privacy, scaleMax, !allowDecimals); }}
                className={`flex-1 rounded-xl font-bold text-sm py-3 transition-all border ${allowDecimals ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
            >
                Decimali: {allowDecimals ? 'ON' : 'OFF'}
            </button>
        </div>
      </section>

      {/* 2. GESTIONE FATTORI */}
      <section className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800">
        <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 tracking-widest text-center">{t.setup.section_factors}</h3>
        
        {/* Input Box */}
        <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700 mb-6 space-y-3">
            <input 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-indigo-500"
                placeholder={t.setup.factor_placeholder}
            />
            
            <div className="grid grid-cols-2 gap-2">
                <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-700">
                    <button onClick={() => setNewType('vote')} className={`flex-1 rounded-lg text-[10px] md:text-xs font-bold py-2 ${newType === 'vote' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>👤 Voto</button>
                    <button onClick={() => setNewType('static')} className={`flex-1 rounded-lg text-[10px] md:text-xs font-bold py-2 ${newType === 'static' ? 'bg-amber-600 text-white' : 'text-gray-400'}`}>⚙️ Dati</button>
                </div>

                <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-700">
                    <button onClick={() => setNewTrend('higher_better')} className={`flex-1 rounded-lg text-[10px] md:text-xs font-bold py-2 ${newTrend === 'higher_better' ? 'bg-green-600/80 text-white' : 'text-gray-400'}`}>↗️ Alto</button>
                    <button onClick={() => setNewTrend('lower_better')} className={`flex-1 rounded-lg text-[10px] md:text-xs font-bold py-2 ${newTrend === 'lower_better' ? 'bg-red-600/80 text-white' : 'text-gray-400'}`}>↘️ Basso</button>
                </div>
            </div>

            <div className="flex gap-2">
                <div className="flex items-center gap-2 bg-gray-900 px-3 rounded-xl border border-gray-700 flex-1">
                    <span className="text-xs text-gray-500 font-bold uppercase">{t.setup.factor_weight_ph}:</span>
                    <input 
                        type="number" step="0.1"
                        value={newWeight}
                        onChange={(e) => setNewWeight(Number(e.target.value))}
                        className="w-full bg-transparent text-sm font-mono text-right outline-none py-3"
                    />
                </div>
                <button 
                    onClick={addFactor} 
                    className="bg-indigo-600 px-6 rounded-xl font-bold hover:bg-indigo-500 shadow-lg"
                >
                    +
                </button>
            </div>
        </div>

        {/* Lista */}
        <div className="space-y-2">
            {factors.map((f) => (
                <div key={f.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-xl border border-gray-700">
                    <div className="flex flex-col">
                        <span className="font-bold text-sm flex items-center gap-2">
                            {f.name}
                            {f.type === 'static' && <span className="text-[9px] bg-amber-900/50 text-amber-200 px-1.5 py-0.5 rounded border border-amber-800">DATA</span>}
                            {f.trend === 'lower_better' && <span className="text-[9px] bg-red-900/50 text-red-200 px-1.5 py-0.5 rounded border border-red-800">↘ LOW</span>}
                        </span>
                        <span className="text-xs text-gray-500">Weight: {f.weight}</span>
                    </div>
                    
                    <button 
                        onClick={() => removeFactor(f.id)} 
                        disabled={factors.length <= 1}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-900/30 hover:text-red-400"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
      </section>
    </div>
  )
}