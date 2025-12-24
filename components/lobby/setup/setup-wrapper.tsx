'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import ShareModal from '@/components/lobby/share-modal'
import SettingsForm from './settings-form'
import CandidatesManager from './candidates-manager'

export default function SetupWrapper({ lobby, userId }: { lobby: any, userId: string }) {
  const { t } = useLanguage()
  const supabase = createClient()
  const [tab, setTab] = useState<'candidates' | 'settings'>('candidates')
  const [showShare, setShowShare] = useState(false)

  const updateSettings = async (newSettings: any) => {
    const { error } = await supabase.from('lobbies').update({ settings: newSettings }).eq('id', lobby.id)
    if (error) toast.error("Error saving settings")
  }

  const startElection = async () => {
    const { count } = await supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('lobby_id', lobby.id)
    if ((count || 0) < 2) return toast.error("Need at least 2 candidates")

    await supabase.from('lobbies').update({ status: 'voting' }).eq('id', lobby.id)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center p-4">
        
        <header className="w-full max-w-2xl text-center space-y-4 mb-8 pt-8">
            <div className="inline-flex items-center justify-center gap-2 bg-gray-900 border border-gray-800 rounded-full px-4 py-1 text-xs font-mono text-gray-400">
                <span>{t.lobby.code_label} {lobby.code}</span>
                <button onClick={() => setShowShare(true)} className="text-indigo-400 hover:underline font-bold">{t.lobby.share_link}</button>
            </div>
            <h1 className="text-3xl font-bold">{t.lobby.setup_title}</h1>
        </header>

        <div className="w-full max-w-2xl bg-black/20 backdrop-blur-sm rounded-3xl border border-gray-800/50 p-1 shadow-2xl overflow-hidden">
            
            <div className="grid grid-cols-2 p-1 bg-gray-900/80 rounded-t-3xl border-b border-gray-800">
                <button 
                    onClick={() => setTab('candidates')}
                    className={`py-3 text-sm font-bold rounded-2xl transition-all ${tab === 'candidates' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    {t.lobby.tab_candidates}
                </button>
                <button 
                    onClick={() => setTab('settings')}
                    className={`py-3 text-sm font-bold rounded-2xl transition-all ${tab === 'settings' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    {t.lobby.tab_settings}
                </button>
            </div>

            <div className="p-4 md:p-8 min-h-[400px]">
                {tab === 'candidates' ? (
                    <CandidatesManager lobby={lobby} />
                ) : (
                    <SettingsForm lobby={lobby} updateSettings={updateSettings} />
                )}
            </div>

            <div className="p-4 bg-gray-900/50 border-t border-gray-800">
                <button 
                    onClick={startElection}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-900/20 transition-all active:scale-[0.98]"
                >
                    {t.lobby.start_btn}
                </button>
            </div>
        </div>

        {showShare && <ShareModal code={lobby.code} onClose={() => setShowShare(false)} />}
    </div>
  )
}