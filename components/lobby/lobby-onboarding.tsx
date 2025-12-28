'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { useLanguage } from '@/components/providers/language-provider'
import Avatar from '@/components/ui/avatar'
import { toast } from 'sonner'
import { UI } from '@/lib/constants'

export default function LobbyOnboarding({ lobbyId, userId, onJoin }: { lobbyId: string, userId: string, onJoin: (nickname: string) => void }) {
  const { t } = useLanguage()
  const supabase = createClient()
  
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim()) return

    setLoading(true)
    
    
    
    const payload = {
        lobby_id: lobbyId,
        user_id: userId,
        nickname: nickname.trim(),
        
    }

    const { error } = await supabase.from('lobby_participants').upsert(payload as any)

    if (error) {
        console.error("Supabase Error:", error)
        toast.error(`Error: ${error.message}`) 
        setLoading(false)
    } else {
        onJoin(nickname.trim())
    }
  }

  
  const gridBg = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 relative overflow-hidden" style={{ backgroundImage: gridBg }}>
      
      <div className={`w-full max-w-md bg-gray-900/90 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500`}>
          <div className="text-center space-y-3 mb-8">
              <h1 className="text-3xl font-black text-white tracking-tight">{t.onboarding.title}</h1>
              <p className="text-gray-400 text-sm">{t.onboarding.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-center">
                  <div className="relative group">
                      <div className={`absolute -inset-1 bg-gradient-to-r from-${UI.COLORS.PRIMARY}-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200`}></div>
                      <Avatar seed={nickname || "guest"} className="w-24 h-24 text-4xl relative" />
                  </div>
              </div>

              <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500 tracking-wider ml-1">{t.onboarding.label_nickname}</label>
                  <input 
                    type="text" 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder={t.onboarding.placeholder_nickname}
                    className={`w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white text-lg focus:ring-2 focus:ring-${UI.COLORS.PRIMARY}-500 focus:border-transparent outline-none transition-all placeholder:text-gray-700`}
                    maxLength={20}
                    autoFocus
                  />
              </div>

              <button 
                type="submit" 
                disabled={loading || !nickname.trim()}
                className={`w-full py-4 bg-${UI.COLORS.PRIMARY}-600 hover:bg-${UI.COLORS.PRIMARY}-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-${UI.COLORS.PRIMARY}-900/20 transition-all transform active:scale-[0.98]`}
              >
                {loading ? t.common.loading : t.onboarding.join_btn}
              </button>
          </form>
      </div>
    </div>
  )
}