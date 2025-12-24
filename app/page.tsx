'use client'

import { createClient } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { UI } from '@/lib/constants'

export default function Home() {
  const { t } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const supabase = createClient()

  const ensureAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) return user.id
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) throw error
    return data.user?.id
  }

  const createLobby = async () => {
    setLoading(true)
    const toastId = toast.loading(t.home.toast_init)

    try {
      const userId = await ensureAuth()
      const code = Math.floor(1000 + Math.random() * 9000).toString()

      const { data, error } = await supabase
        .from('lobbies')
        .insert([{ 
            code, 
            host_id: userId,
            status: 'setup',
            settings: { 
                privacy: 'private', 
                voting_scale: { max: 10 }, 
                factors: [{ id: "general", name: "General Vote", weight: 1.0, type: 'vote', trend: 'higher_better' }]
            } 
          }])
        .select().single()

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

  const joinLobby = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode || joinCode.length < 4) return toast.error(t.home.error_code_short)
    
    setLoading(true)
    try {
        await ensureAuth()
        const { data, error } = await supabase.from('lobbies').select('code').eq('code', joinCode).single()
        if (error || !data) throw new Error("Not found")
        router.push(`/lobby/${joinCode}`)
    } catch (error) {
        toast.error(t.home.error_lobby_not_found)
    } finally {
        setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-950 text-white relative overflow-hidden">
      
      {/* Sfondo Decorativo */}
      <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-${UI.COLORS.PRIMARY}-900/20 via-gray-950 to-gray-950 z-0 pointer-events-none`}></div>

      <div className="z-10 w-full max-w-md md:max-w-2xl text-center space-y-10 md:space-y-16 animate-in fade-in zoom-in-95 duration-700">
        
        {/* TITOLO */}
        <div className="space-y-6">
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 whitespace-pre-line leading-tight drop-shadow-2xl">
                {t.home.title}
            </h1>
            <p className="text-gray-400 text-sm md:text-xl font-mono px-4">
                {t.home.subtitle}
            </p>
        </div>
        
        {/* AZIONI */}
        <div className={`flex flex-col items-center gap-6 w-full px-4 ${UI.LAYOUT.MAX_WIDTH_CONTAINER} mx-auto`}>
            
            <button
                onClick={createLobby}
                disabled={loading}
                className="w-full py-5 bg-white text-black font-black text-lg md:text-xl rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_50px_-15px_rgba(255,255,255,0.4)] disabled:opacity-50"
            >
                {loading ? t.home.cta_loading : t.home.cta_button}
            </button>

            <div className="flex items-center w-full gap-4 opacity-40">
                <div className="h-px bg-gray-600 flex-1"></div>
                <span className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">{t.home.or_divider}</span>
                <div className="h-px bg-gray-600 flex-1"></div>
            </div>

            <form onSubmit={joinLobby} className="w-full flex flex-col md:flex-row gap-3">
                <input 
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder={t.home.join_placeholder}
                    className={`flex-1 bg-gray-900 border border-gray-800 ${UI.LAYOUT.ROUNDED_MD} px-4 py-4 text-center font-mono text-lg focus:ring-2 focus:ring-${UI.COLORS.PRIMARY}-500 outline-none transition-all placeholder:text-gray-700`}
                    maxLength={5}
                />
                <button 
                    type="submit"
                    disabled={loading || joinCode.length < 4}
                    className={`bg-gray-800 hover:bg-gray-700 border border-gray-700 disabled:opacity-50 text-white font-bold px-8 py-4 ${UI.LAYOUT.ROUNDED_MD} transition-all active:scale-[0.98]`}
                >
                    {t.home.join_btn}
                </button>
            </form>

            <p className="text-[10px] md:text-xs text-gray-600 uppercase tracking-widest font-bold mt-4">
                {t.home.no_registration}
            </p>
        </div>
      </div>
    </main>
  )
}