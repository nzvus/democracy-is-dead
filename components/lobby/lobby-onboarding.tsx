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
    
    const { error } = await supabase.from('lobby_participants').upsert({
        lobby_id: lobbyId,
        user_id: userId,
        nickname: nickname.trim(),
        avatar_url: null,
        joined_at: new Date().toISOString()
    })

    if (error) {
        console.error(error)
        toast.error(t.common.error)
        setLoading(false)
    } else {
        onJoin(nickname.trim())
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className={`w-full max-w-md bg-gray-900 border border-gray-800 p-8 ${UI.LAYOUT.ROUNDED_LG} shadow-2xl`}>
          <div className="text-center space-y-2 mb-8">
              <h1 className="text-2xl font-bold text-white">{t.onboarding.title}</h1>
              <p className="text-gray-400 text-sm">{t.onboarding.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center">
                  <Avatar seed={nickname || "guest"} className="w-24 h-24 text-4xl" />
              </div>

              <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">{t.onboarding.label_nickname}</label>
                  <input 
                    type="text" 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder={t.onboarding.placeholder_nickname}
                    className={`w-full ${UI.COLORS.BG_INPUT} border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-${UI.COLORS.PRIMARY}-500 outline-none transition-all`}
                    maxLength={15}
                    autoFocus
                  />
              </div>

              <button 
                type="submit" 
                disabled={loading || !nickname.trim()}
                className={`w-full py-4 bg-${UI.COLORS.PRIMARY}-600 hover:bg-${UI.COLORS.PRIMARY}-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-[0.98]`}
              >
                {loading ? t.common.loading : t.onboarding.join_btn}
              </button>
          </form>
      </div>
    </div>
  )
}