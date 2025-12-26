'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { useLanguage } from '@/components/providers/language-provider'
import { toast } from 'sonner'
import { UI } from '@/lib/constants'

export default function LobbyOnboarding({ lobby, userId, onJoin }: { lobby: any, userId: string, onJoin: () => void }) {
  const { t } = useLanguage()
  const supabase = createClient()
  
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)

  const handleJoin = async () => {
      if(!nickname.trim()) {
          // CORRETTO: Usa t.onboarding
          toast.error(t.onboarding.error_nick)
          return
      }
      setLoading(true)

      const avatarUrl = `https://api.dicebear.com/9.x/notionists/svg?seed=${nickname}`

      const { error } = await supabase.from('lobby_participants').insert({
            lobby_id: lobby.id,
            user_id: userId,
            nickname: nickname,
            avatar_url: avatarUrl,
            has_voted: false
      })
      
      if (error) {
          toast.error(t.common.error)
          setLoading(false)
      } else {
          onJoin()
      }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className={`w-full max-w-md ${UI.COLORS.BG_CARD} border border-gray-800 p-8 ${UI.LAYOUT.ROUNDED_LG} shadow-2xl space-y-8 animate-in zoom-in-95 duration-300`}>
            
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black text-white">{t.onboarding.title}</h1>
                <p className="text-gray-400">{t.onboarding.subtitle}</p>
            </div>

            <div className="flex justify-center">
                 <div className="w-24 h-24 rounded-full bg-gray-900 border-2 border-dashed border-gray-700 flex items-center justify-center overflow-hidden relative group">
                    {nickname ? (
                        <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${nickname}`} alt="Avatar" className="w-full h-full object-cover animate-in fade-in" />
                    ) : (
                        <span className="text-4xl grayscale opacity-50">{t.onboarding.avatar_placeholder}</span>
                    )}
                 </div>
            </div>

            <div className="space-y-4">
                <input 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder={t.onboarding.nick_placeholder}
                    className={`w-full ${UI.COLORS.BG_INPUT} p-4 rounded-xl outline-none text-center font-bold text-lg focus:ring-2 focus:ring-${UI.COLORS.PRIMARY}-500 transition-all`}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                    autoFocus
                />
                
                <button 
                    onClick={handleJoin}
                    disabled={loading}
                    className={`w-full bg-${UI.COLORS.PRIMARY}-600 hover:bg-${UI.COLORS.PRIMARY}-500 text-white font-black py-4 rounded-xl text-xl shadow-lg hover:shadow-${UI.COLORS.PRIMARY}-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100`}
                >
                    {loading ? t.common.loading : t.onboarding.join_btn}
                </button>
            </div>

        </div>
    </div>
  )
}