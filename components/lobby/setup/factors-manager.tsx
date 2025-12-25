'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { Factor } from '@/types'
import { UI } from '@/lib/constants'

export default function FactorsManager({ lobby }: { lobby: any }) {
  const { t } = useLanguage()
  const supabase = createClient()
  const [factors, setFactors] = useState<Factor[]>(lobby.settings.factors || [])
  const [loading, setLoading] = useState(false)

  // Form State
  const [newName, setNewName] = useState('')
  const [newWeight, setNewWeight] = useState(1)
  const [newType, setNewType] = useState<'vote'|'static'>('vote')
  const [newTrend, setNewTrend] = useState<'higher_better'|'lower_better'>('higher_better')

  const saveFactors = async (updatedFactors: Factor[]) => {
    setLoading(true)
    const newSettings = { ...lobby.settings, factors: updatedFactors }
    
    const { error } = await supabase
      .from('lobbies')
      .update({ settings: newSettings })
      .eq('id', lobby.id)

    if (error) {
        toast.error(t.common.error)
    } else {
        setFactors(updatedFactors)
        toast.success(t.common.saved)
    }
    setLoading(false)
  }

  const addFactor = async () => {
    if (!newName.trim()) return

    const newFactor: Factor = {
        id: Math.random().toString(36).substr(2, 9),
        name: newName,
        weight: newWeight,
        type: newType,
        trend: newTrend
    }

    await saveFactors([...factors, newFactor])
    setNewName('')
    setNewWeight(1)
  }

  const removeFactor = async (id: string) => {
    if (factors.length <= 1) {
        toast.error("Devi avere almeno un fattore di voto!")
        return
    }
    await saveFactors(factors.filter(f => f.id !== id))
  }

  return (
    <div className={`space-y-8 animate-in fade-in mx-auto ${UI.LAYOUT.MAX_WIDTH_CONTAINER}`}>
        
        {/* ADD FACTOR FORM */}
        <div className={`${UI.COLORS.BG_CARD} ${UI.LAYOUT.PADDING_X} ${UI.LAYOUT.PADDING_Y} ${UI.LAYOUT.ROUNDED_LG} space-y-4`}>
            <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest text-center">{t.setup.add_factor_btn}</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400">Nome Fattore</label>
                    <input 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Es. Prezzo, Estetica..."
                        className={`w-full ${UI.COLORS.BG_INPUT} ${UI.LAYOUT.ROUNDED_MD} p-3 outline-none focus:border-${UI.COLORS.PRIMARY}-500`}
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400">{t.setup.factor_weight} (x{newWeight})</label>
                    <input 
                        type="range" min="0.5" max="5" step="0.5"
                        value={newWeight}
                        onChange={(e) => setNewWeight(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-400">Tipo</label>
                     <div className="flex gap-2">
                        <button onClick={() => setNewType('vote')} className={`flex-1 py-2 text-xs font-bold rounded border ${newType === 'vote' ? `bg-${UI.COLORS.PRIMARY}-900 border-${UI.COLORS.PRIMARY}-500` : 'bg-gray-800 border-gray-700'}`}>
                            🗳️ {t.setup.factor_type_vote}
                        </button>
                        <button onClick={() => setNewType('static')} className={`flex-1 py-2 text-xs font-bold rounded border ${newType === 'static' ? 'bg-amber-900 border-amber-500' : 'bg-gray-800 border-gray-700'}`}>
                            📊 {t.setup.factor_type_static}
                        </button>
                     </div>
                </div>

                <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-400">Trend</label>
                     <div className="flex gap-2">
                        <button onClick={() => setNewTrend('higher_better')} className={`flex-1 py-2 text-xs font-bold rounded border ${newTrend === 'higher_better' ? 'bg-green-900/30 border-green-500' : 'bg-gray-800 border-gray-700'}`}>
                            ↗ {t.setup.trend_high}
                        </button>
                        <button onClick={() => setNewTrend('lower_better')} className={`flex-1 py-2 text-xs font-bold rounded border ${newTrend === 'lower_better' ? 'bg-red-900/30 border-red-500' : 'bg-gray-800 border-gray-700'}`}>
                            ↘ {t.setup.trend_low}
                        </button>
                     </div>
                </div>
            </div>

            <button 
                onClick={addFactor}
                disabled={loading || !newName}
                className={`w-full bg-${UI.COLORS.PRIMARY}-600 hover:bg-${UI.COLORS.PRIMARY}-500 disabled:opacity-50 text-white font-bold py-3 ${UI.LAYOUT.ROUNDED_MD} transition-all`}
            >
                {loading ? '...' : '+ ' + t.common.save}
            </button>
        </div>

        {/* LIST FACTORS */}
        <div className="space-y-3">
            {factors.map((f, i) => (
                <div key={i} className={`${UI.COLORS.BG_CARD} p-4 ${UI.LAYOUT.ROUNDED_MD} flex justify-between items-center border border-gray-800`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-gray-800 border ${f.type === 'static' ? 'border-amber-500/50 text-amber-500' : 'border-gray-700'}`}>
                            {f.type === 'static' ? '📊' : '🗳️'}
                        </div>
                        <div>
                            <p className="font-bold">{f.name}</p>
                            <div className="flex gap-2 text-[10px] uppercase font-bold text-gray-500">
                                <span>Weight: x{f.weight}</span>
                                <span>•</span>
                                <span>{f.trend === 'higher_better' ? 'High Good' : 'Low Good'}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => removeFactor(f.id)} className="text-gray-500 hover:text-red-500 px-3">
                        {t.common.delete}
                    </button>
                </div>
            ))}
        </div>
    </div>
  )
}