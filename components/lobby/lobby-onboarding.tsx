'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useLanguage } from '@/components/providers/language-provider'
import { toast } from 'sonner'

export default function LobbyOnboarding({ lobby, userId, onJoin }: { lobby: any, userId: string, onJoin: () => void }) {
  const { t } = useLanguage()
  const supabase = createClient()
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)

  // Avatar dinamico basato sul nickname (o random se vuoto)
  const seed = nickname.trim() || 'random' 
  const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim()) return toast.error(t.onboarding.error_nick)
    
    setLoading(true)
    
    // Salviamo il partecipante nel DB
    const { error } = await supabase
        .from('lobby_participants')
        .upsert({
            lobby_id: lobby.id,
            user_id: userId,
            nickname: nickname.trim(),
            avatar_seed: seed,
            has_voted: false
        }, { onConflict: 'lobby_id, user_id' })

    if (error) {
        toast.error("Error joining: " + error.message)
        setLoading(false)
    } else {
        // Callback per dire alla pagina "Ok, è dentro"
        onJoin()
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-900/50 border border-gray-800 p-8 rounded-3xl backdrop-blur-sm shadow-2xl text-center space-y-8 animate-in fade-in zoom-in duration-300">
        
        <div>
            <h1 className="text-3xl font-bold mb-2">{t.onboarding.title}</h1>
            <p className="text-gray-400">{t.onboarding.subtitle}</p>
        </div>

        {/* Avatar Preview */}
        <div className="w-32 h-32 mx-auto bg-gray-800 rounded-full overflow-hidden border-4 border-gray-700 shadow-xl relative">
            <img 
                src={avatarUrl} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
            />
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
            <input 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={t.onboarding.nick_placeholder}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-center text-lg font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                maxLength={15}
                autoFocus
            />
            
            <button 
                type="submit"
                disabled={loading || !nickname.trim()}
                className="w-full py-4 bg-white text-black font-bold text-lg rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
                {loading ? '...' : t.onboarding.join_btn}
            </button>
        </form>

      </div>
    </div>
  )
}