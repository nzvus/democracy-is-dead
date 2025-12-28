'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { UI } from '@/lib/constants'
import { Factor, Candidate } from '@/types'

import SettingsForm from './settings-form'
import CandidatesManager from './candidates-manager'
import FactorsManager from './factors-manager'

interface SetupWrapperProps {
  lobby: {
      id: string;
      code: string;
      settings: any; 
  }
} 

export default function SetupWrapper({ lobby }: SetupWrapperProps) {
  const { t } = useLanguage()
  const supabase = createClient()
  
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)

  const [votingScale, setVotingScale] = useState({ min: 0, max: 10 })
  const [factors, setFactors] = useState<Factor[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])

  const handleSave = async () => {
      setLoading(true)
      
      const settings = {
          voting_scale: votingScale,
          factors: factors,
          allow_decimals: false 
      }
      
      const { error: lErr } = await supabase.from('lobbies').update({ settings, status: 'voting' }).eq('id', lobby.id)
      if (lErr) { toast.error(t.common.error); setLoading(false); return }

      if (candidates.length > 0) {
          const payload = candidates.map(c => ({
              lobby_id: lobby.id,
              name: c.name,
              description: c.description,
              image_url: c.image_url
          }))
          const { error: cErr } = await supabase.from('candidates').insert(payload)
          if (cErr) { console.error(cErr); toast.error("Error saving candidates"); }
      }

      setLoading(false)
      toast.success(t.common.saved)
  }

  return (
    <div className={`min-h-screen bg-gray-950 text-white ${UI.LAYOUT.PADDING_X} py-8`}>
        <div className={`max-w-2xl mx-auto space-y-8`}>
            
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black tracking-tight">{t.setup.header.title}</h1>
                <div className="flex justify-center gap-2">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`h-2 w-12 rounded-full transition-colors ${step >= s ? `bg-${UI.COLORS.PRIMARY}-500` : 'bg-gray-800'}`} />
                    ))}
                </div>
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest pt-2">
                    {step === 1 ? t.setup.header.step_1 : step === 2 ? t.setup.header.step_2 : t.setup.header.step_3}
                </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 p-6 md:p-8 rounded-2xl shadow-xl min-h-[400px]">
                {step === 1 && <SettingsForm scale={votingScale} setScale={setVotingScale} />}
                {step === 2 && <CandidatesManager candidates={candidates} setCandidates={setCandidates} />}
                {step === 3 && <FactorsManager factors={factors} setFactors={setFactors} />}
            </div>

            <div className="flex justify-between pt-4">
                <button 
                    onClick={() => setStep(prev => Math.max(1, prev - 1) as any)}
                    disabled={step === 1}
                    className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-800 disabled:opacity-0 transition-all"
                >
                    {t.setup.buttons.back}
                </button>

                {step < 3 ? (
                    <button 
                        onClick={() => setStep(prev => Math.min(3, prev + 1) as any)}
                        className={`px-8 py-3 bg-white text-black rounded-xl font-bold hover:scale-105 transition-transform`}
                    >
                        {t.setup.buttons.next}
                    </button>
                ) : (
                    <button 
                        onClick={handleSave}
                        disabled={loading || candidates.length < 2}
                        className={`px-8 py-3 bg-${UI.COLORS.PRIMARY}-600 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-${UI.COLORS.PRIMARY}-900/20`}
                    >
                        {loading ? t.setup.buttons.saving : t.setup.buttons.start}
                    </button>
                )}
            </div>

        </div>
    </div>
  )
}