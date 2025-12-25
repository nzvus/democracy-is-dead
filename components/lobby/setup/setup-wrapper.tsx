'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { UI } from '@/lib/constants'

// Componenti
import CandidatesManager from './candidates-manager'
import FactorsManager from './factors-manager'
import SettingsForm from './settings-form' // <--- IMPORT NUOVO
import ShareLobby from '../share-lobby'

export default function SetupWrapper({ lobby, userId }: { lobby: any, userId: string }) {
  const { t } = useLanguage()
  const supabase = createClient()
  
  // Tabs: aggiunta 'settings'
  const [activeTab, setActiveTab] = useState<'candidates' | 'factors' | 'settings'>('candidates')
  const [loading, setLoading] = useState(false)

  const startVoting = async () => {
    // 1. Controllo Candidati
    const { count } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .eq('lobby_id', lobby.id)

    if ((count || 0) < 2) {
        toast.error("Devi avere almeno 2 candidati per iniziare!")
        return
    }

    // 2. Controllo Fattori
    const factors = lobby.settings.factors || []
    if (factors.length === 0) {
        toast.error("Devi impostare almeno un criterio di voto!")
        setActiveTab('factors')
        return
    }

    if(confirm(t.common.confirm + "?")){
        setLoading(true)
        const { error } = await supabase.from('lobbies').update({ status: 'voting' }).eq('id', lobby.id)
        
        if (error) toast.error(t.common.error)
        else toast.success("Votazione avviata!")
        
        setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen bg-gray-950 text-white pb-32`}>
        
        {/* HEADER & SHARE */}
        <div className={`bg-gray-900 border-b border-gray-800 sticky top-0 z-40 shadow-xl`}>
            <div className={`${UI.LAYOUT.MAX_WIDTH_CONTAINER} ${UI.LAYOUT.PADDING_X} py-6 mx-auto`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">{t.setup.title}</h1>
                        <p className="text-gray-400 text-xs">{t.setup.subtitle}</p>
                    </div>
                    <ShareLobby code={lobby.code} />
                </div>

                {/* TABS NAVIGATION */}
                <div className="flex gap-2 bg-black/20 p-1 rounded-xl w-full md:w-auto self-start border border-gray-800 overflow-x-auto">
                    <button 
                        onClick={() => setActiveTab('candidates')}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'candidates' ? `bg-${UI.COLORS.PRIMARY}-600 text-white shadow-lg` : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}
                    >
                        {t.setup.tabs.candidates}
                    </button>
                    <button 
                        onClick={() => setActiveTab('factors')}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'factors' ? `bg-${UI.COLORS.PRIMARY}-600 text-white shadow-lg` : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}
                    >
                        {t.setup.tabs.factors}
                    </button>
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'settings' ? `bg-${UI.COLORS.PRIMARY}-600 text-white shadow-lg` : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}
                    >
                        {t.setup.tabs.settings}
                    </button>
                </div>
            </div>
        </div>

        {/* CONTENT AREA */}
        <div className={`pt-8 ${UI.LAYOUT.PADDING_X}`}>
            {activeTab === 'candidates' && <CandidatesManager lobby={lobby} />}
            {activeTab === 'factors' && <FactorsManager lobby={lobby} />}
            {activeTab === 'settings' && <SettingsForm lobby={lobby} />}
        </div>

        {/* FOOTER ACTION (Avvia Voto) */}
        <div className="fixed bottom-0 left-0 w-full p-6 bg-gray-950/95 backdrop-blur-xl border-t border-gray-800 z-50">
             <button 
                onClick={startVoting}
                disabled={loading}
                className={`w-full ${UI.LAYOUT.MAX_WIDTH_CONTAINER} mx-auto py-4 bg-green-600 hover:bg-green-500 text-white ${UI.LAYOUT.ROUNDED_MD} font-black text-lg shadow-lg shadow-green-900/20 transition-all active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2`}
            >
                {loading ? t.common.loading : t.setup.start_voting_btn} 🚀
            </button>
        </div>
    </div>
  )
}