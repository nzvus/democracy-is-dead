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
  const [joinCode, setJoinCode] = useState('') // Stato per il codice input
  const supabase = createClient()

  // Funzione condivisa per garantire l'accesso anonimo
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
      const userId = await ensureAuth() // Login anonimo o recupero utente
      const code = Math.floor(1000 + Math.random() * 9000).toString()

      const { data, error } = await supabase
        .from('lobbies')
        .insert([{ 
            code, 
            host_id: userId,
            status: 'setup',
            settings: { 
                privacy: 'private', 
                voting_method: 'schulze', 
                allow_jolly: true,
                timer_seconds: 0,
                factors: [{ id: "general", name: "General Vote", weight: 1.0 }]
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

  // NUOVA FUNZIONE: Entra con codice
  const joinLobby = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode || joinCode.length < 4) return toast.error("Codice non valido")
    
    setLoading(true)
    try {
        await ensureAuth() // Si assicura che tu sia loggato come anonimo
        
        // Controlla se la lobby esiste
        const { data, error } = await supabase
            .from('lobbies')
            .select('code')
            .eq('code', joinCode)
            .single()
            
        if (error || !data) throw new Error("Lobby non trovata")
        
        router.push(`/lobby/${joinCode}`) // Redirect sicuro
    } catch (error) {
        toast.error("Lobby inesistente o chiusa.")
    } finally {
        setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-950 text-white relative overflow-hidden">
      <LanguageSwitcher />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-gray-950 to-gray-950 z-0"></div>

      <div className="z-10 max-w-3xl text-center space-y-12">
        <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 whitespace-pre-line">
            {t.home.title}
            </h1>
            <p className="text-gray-400 text-lg md:text-xl font-mono">
            {t.home.subtitle}
            </p>
        </div>
        
        <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
            {/* BOTTONE CREA */}
            <button
                onClick={createLobby}
                disabled={loading}
                className="w-full py-4 bg-white text-black font-bold text-xl rounded-full hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] disabled:opacity-50"
            >
                {loading ? t.home.cta_loading : t.home.cta_button}
            </button>

            <div className="flex items-center w-full gap-4">
                <div className="h-px bg-gray-800 flex-1"></div>
                <div className="h-px bg-gray-800 flex-1"></div>
            </div>

            {/* FORM ENTRA CON CODICE */}
            <form onSubmit={joinLobby} className="w-full flex gap-2">
                <input 
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Codice Lobby (es. 1234)"
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-center font-mono text-lg tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    maxLength={4}
                />
                <button 
                    type="submit"
                    disabled={loading || joinCode.length < 4}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold px-6 rounded-xl transition-all"
                >
                    Entra ➤
                </button>
            </form>

            <p className="text-xs text-gray-600 uppercase tracking-widest font-bold mt-2">
                {t.home.no_registration}
            </p>
        </div>
      </div>
    </main>
  )
}