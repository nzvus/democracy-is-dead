'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'  
import LanguageSwitcher from '@/components/ui/language-switcher'  

export default function Home() {
  const { t } = useLanguage() 
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const createLobby = async () => {
    setLoading(true)
    const toastId = toast.loading(t.home.toast_init) 

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      let userId = user?.id

      if (authError || !userId) {
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
        if (anonError) throw anonError
        userId = anonData.user?.id
      }
      
      const code = Math.floor(1000 + Math.random() * 9000).toString()

       const { data, error } = await supabase
        .from('lobbies')
        .insert([
          { 
            code, 
            host_id: userId,
            status: 'setup',
            settings: { 
                privacy: 'private', 
                voting_method: 'schulze', 
                allow_jolly: true,
                timer_seconds: 0,
                factors: [{ id: "general", name: "General Vote", weight: 1.0 }] // Uso inglese come chiave DB
            } 
          }
        ])
        .select()
        .single()

      if (error) throw error

      toast.dismiss(toastId)
      toast.success(t.home.toast_success) 
      router.push(`/lobby/${data.code}`)

    } catch (err: any) {
      console.error(err)
      toast.dismiss(toastId)
      toast.error(t.home.toast_error + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-950 text-white relative overflow-hidden">
      
      <LanguageSwitcher />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-gray-950 to-gray-950 z-0"></div>

      <div className="z-10 max-w-3xl text-center space-y-10">
        <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 whitespace-pre-line">
            {t.home.title} 
            </h1>
            <p className="text-gray-400 text-lg md:text-xl font-mono">
            {t.home.subtitle} 
            </p>
        </div>
        
        <div className="flex flex-col items-center gap-4">
            <button
                onClick={createLobby}
                disabled={loading}
                className="group relative px-8 py-4 bg-white text-black font-bold text-xl rounded-full hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:scale-100"
            >
                {loading ? t.home.cta_loading : t.home.cta_button} {/* <--- USA VARIABILI */}
                <span className="absolute inset-0 rounded-full border border-white/50 animate-ping opacity-20"></span>
            </button>
            <p className="text-xs text-gray-600 uppercase tracking-widest font-bold">
                {t.home.no_registration} 
            </p>
        </div>
      </div>
    </main>
  )
}