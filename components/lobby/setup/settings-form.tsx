'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { UI } from '@/lib/constants'

export default function SettingsForm({ lobby }: { lobby: any }) {
  const { t } = useLanguage()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  // State locale inizializzato dai settings del DB
  const [maxScale, setMaxScale] = useState<number>(lobby.settings.voting_scale?.max || 10)
  const [allowDecimals, setAllowDecimals] = useState<boolean>(lobby.settings.allow_decimals || false)

  const saveSettings = async (newMax: number, newDecimals: boolean) => {
    setLoading(true)
    const newSettings = { 
        ...lobby.settings, 
        voting_scale: { ...lobby.settings.voting_scale, max: newMax },
        allow_decimals: newDecimals
    }
    
    const { error } = await supabase
      .from('lobbies')
      .update({ settings: newSettings })
      .eq('id', lobby.id)

    if (error) toast.error(t.common.error)
    else toast.success(t.common.saved)
    
    setLoading(false)
  }

  // Admin Power: Reset Voti
  const resetVotes = async () => {
      if(!confirm(t.setup.settings_tab.reset_confirm)) return;

      setLoading(true)
      
      // 1. Cancella voti
      const { error: delError } = await supabase.from('votes').delete().eq('lobby_id', lobby.id)
      
      // 2. Resetta stato partecipanti
      const { error: upError } = await supabase
        .from('lobby_participants')
        .update({ has_voted: false })
        .eq('lobby_id', lobby.id)

      if (delError || upError) toast.error(t.common.error)
      else toast.success(t.setup.settings_tab.reset_success)
      
      setLoading(false)
  }

  return (
    <div className={`space-y-8 animate-in fade-in mx-auto ${UI.LAYOUT.MAX_WIDTH_CONTAINER}`}>
        
        {/* CARD IMPOSTAZIONI */}
        <div className={`${UI.COLORS.BG_CARD} ${UI.LAYOUT.PADDING_X} ${UI.LAYOUT.PADDING_Y} ${UI.LAYOUT.ROUNDED_LG} space-y-6 border border-gray-800`}>
            <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest text-center">
                {t.setup.settings_tab.title}
            </h3>

            {/* Scala Max */}
            <div className="space-y-2">
                <div className="flex justify-between">
                    <label className="text-sm font-bold text-gray-300">{t.setup.settings_tab.scale_label}</label>
                    <span className="font-mono text-yellow-500 font-bold">0 - {maxScale}</span>
                </div>
                <input 
                    type="range" min="5" max="100" step="1"
                    value={maxScale}
                    onChange={(e) => setMaxScale(Number(e.target.value))}
                    onMouseUp={() => saveSettings(maxScale, allowDecimals)} // Salva al rilascio
                    onTouchEnd={() => saveSettings(maxScale, allowDecimals)}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
            </div>

            {/* Toggle Decimali */}
            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                <label className="text-sm font-bold text-gray-300">{t.setup.settings_tab.decimals_label}</label>
                <button 
                    onClick={() => {
                        const newVal = !allowDecimals
                        setAllowDecimals(newVal)
                        saveSettings(maxScale, newVal)
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative ${allowDecimals ? `bg-${UI.COLORS.PRIMARY}-600` : 'bg-gray-700'}`}
                >
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${allowDecimals ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            </div>
        </div>

        {/* DANGER ZONE */}
        <div className="border border-red-900/30 bg-red-950/10 rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase text-red-500 tracking-widest flex items-center gap-2">
                ⚠️ {t.setup.settings_tab.danger_zone}
            </h3>
            
            <button 
                onClick={resetVotes}
                disabled={loading}
                className="w-full py-3 border border-red-800 text-red-400 hover:bg-red-950/50 rounded-lg text-sm font-bold transition-colors"
            >
                {t.setup.settings_tab.reset_votes_btn}
            </button>
        </div>
    </div>
  )
}