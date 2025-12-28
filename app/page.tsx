'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/client'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { UI } from '@/lib/constants'
import { ArrowRight, History, Vote } from 'lucide-react'


const generateCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function Home() {
  const { t, language, setLanguage } = useLanguage()
  const router = useRouter()
  const supabase = createClient()
  
  const [isCreating, setIsCreating] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [recentLobbies, setRecentLobbies] = useState<{code: string, date: string}[]>([])

  
  useEffect(() => {
      const history = localStorage.getItem('did_history')
      if (history) {
          try {
              setRecentLobbies(JSON.parse(history))
          } catch {
              
          }
      }
  }, [])

  const createLobby = async () => {
    setIsCreating(true)
    const toastId = toast.loading(t.home.toast_init)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    let userId = user?.id

    if (authError || !userId) {
        const { data: anonUser, error: anonError } = await supabase.auth.signInAnonymously()
        if (anonError) {
            toast.error(t.home.toast_error, { id: toastId })
            setIsCreating(false)
            return
        }
        userId = anonUser.user?.id
    }

    if (!userId) return

    const code = generateCode()
    
    
    
    const { error: lobbyError } = await supabase.from('lobbies').insert({
        code,
        host_id: userId,
        status: 'waiting',
        settings: { factors: [] }
    })

    if (lobbyError) {
        toast.error(t.home.toast_error, { id: toastId })
    } else {
        toast.success(t.home.toast_success, { id: toastId })
        saveToHistory(code)
        router.push(`/lobby/${code}`)
    }
    setIsCreating(false)
  }

  const joinLobby = async () => {
      if (joinCode.length < 6) {
          toast.error(t.home.error_code_short)
          return
      }

      const { data, error } = await supabase.from('lobbies').select('id').eq('code', joinCode.toUpperCase()).single()
      
      if (error || !data) {
          toast.error(t.home.error_lobby_not_found)
      } else {
          saveToHistory(joinCode.toUpperCase())
          router.push(`/lobby/${joinCode.toUpperCase()}`)
      }
  }

  const saveToHistory = (code: string) => {
      const newHistory = [{ code, date: new Date().toISOString() }, ...recentLobbies.filter(l => l.code !== code)].slice(0, 5)
      localStorage.setItem('did_history', JSON.stringify(newHistory))
  }

  const gridBg = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`

  return (
    <div className={`min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden`} style={{ backgroundImage: gridBg }}>
        
        {}
        <div className="absolute top-6 right-6 z-50">
            <button 
                onClick={() => setLanguage(language === 'it' ? 'en' : 'it')}
                className="bg-gray-900 border border-gray-800 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
            >
                {language === 'it' ? '🇮🇹 IT' : '🇬🇧 EN'}
            </button>
        </div>

        <main className="w-full max-w-md relative z-10 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            
            {}
            <div className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl rotate-3 flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-6">
                    <Vote size={40} className="text-white -rotate-3" />
                </div>
                <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
                    {t.home.title}
                </h1>
                <p className="text-gray-400 text-lg leading-relaxed">
                    {t.home.subtitle}
                </p>
            </div>

            {}
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-6 rounded-3xl shadow-2xl space-y-6">
                
                <button 
                    onClick={createLobby}
                    disabled={isCreating}
                    className={`w-full py-4 bg-${UI.COLORS.PRIMARY}-600 hover:bg-${UI.COLORS.PRIMARY}-500 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group`}
                >
                    {isCreating ? t.home.cta_loading : t.home.cta_button}
                    {!isCreating && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                </button>

                <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-800"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-600 text-xs font-bold uppercase tracking-widest">{t.home.or_divider}</span>
                    <div className="flex-grow border-t border-gray-800"></div>
                </div>

                <div className="flex gap-2">
                    <input 
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder={t.home.join_placeholder}
                        maxLength={6}
                        className={`flex-1 ${UI.COLORS.BG_INPUT} border border-gray-800 rounded-xl px-4 py-3 text-center font-mono text-lg uppercase tracking-widest focus:ring-2 focus:ring-${UI.COLORS.PRIMARY}-500 outline-none transition-all`}
                    />
                    <button 
                        onClick={joinLobby}
                        disabled={!joinCode}
                        className="px-6 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                        {t.home.join_btn}
                    </button>
                </div>

                <p className="text-center text-xs text-gray-600 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    {t.home.no_registration}
                </p>
            </div>            
            {}
            {recentLobbies.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-gray-900/50">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <History size={14} /> {t.home.history}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {recentLobbies.map((l) => (
                            <button 
                                key={l.code}
                                onClick={() => router.push(`/lobby/${l.code}`)}
                                className="bg-gray-900/50 hover:bg-gray-800 border border-gray-800 px-3 py-1.5 rounded-lg text-xs font-mono text-gray-300 transition-colors"
                            >
                                {l.code}
                            </button>
                        ))}
                    </div>
                </div>
            )}

        </main>
    </div>
  )
}