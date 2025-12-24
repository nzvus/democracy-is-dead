'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { UI } from '@/lib/constants'
import { useLanguage } from '@/components/providers/language-provider'
import { toast } from 'sonner'

export default function LobbyOnboarding({ lobby, userId, onJoin }: { lobby: any, userId: string, onJoin: () => void }) {
    const { t } = useLanguage()
    const supabase = createClient()
    const [nickname, setNickname] = useState('')
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    const handleJoin = async () => {
        if(!nickname.trim()) {
            toast.error(t.onboarding.error_nick)
            return
        }
        setLoading(true)

        let avatarUrl = null
        
        // Upload Avatar Utente (Bucket: 'avatars')
        if (avatarFile) {
            const fileExt = avatarFile.name.split('.').pop()
            const filePath = `${lobby.id}/${userId}_${Date.now()}.${fileExt}`
            
            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile)
            
            if (!uploadError) {
                const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
                avatarUrl = data.publicUrl
            } else {
                console.error("Avatar upload failed:", uploadError)
                // Non blocchiamo l'ingresso, ma notifichiamo
                toast.error("Errore upload avatar, useremo default.")
            }
        }
        
        // Se l'upload fallisce o non c'è file, usa DiceBear
        if (!avatarUrl) {
             avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${userId}`
        }

        const { error } = await supabase.from('lobby_participants').insert({
            lobby_id: lobby.id,
            user_id: userId,
            nickname: nickname,
            avatar_url: avatarUrl 
        })
        
        if(!error) {
            onJoin()
        } else {
            toast.error(t.common.error)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6">
            <div className={`w-full max-w-sm ${UI.COLORS.BG_CARD} p-8 ${UI.LAYOUT.ROUNDED_LG} text-center space-y-6 animate-in zoom-in-95`}>
                <div>
                    <h1 className="text-2xl font-bold mb-2">{t.onboarding.title}</h1>
                    <p className="text-gray-400 text-sm">{t.onboarding.subtitle}</p>
                </div>
                
                {/* Avatar Upload UI */}
                <div className="flex justify-center py-4">
                    <label className="relative cursor-pointer group">
                        <div className={`w-28 h-28 rounded-full bg-gray-900 border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden hover:border-${UI.COLORS.PRIMARY}-500 transition-all group-hover:scale-105`}>
                            {avatarFile ? (
                                <img src={URL.createObjectURL(avatarFile)} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl opacity-50">{t.onboarding.avatar_placeholder}</span>
                            )}
                        </div>
                        <div className={`absolute bottom-0 right-0 bg-${UI.COLORS.PRIMARY}-600 rounded-full p-2 shadow-lg border-4 border-gray-900`}>
                            📸
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                    </label>
                </div>

                <input 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder={t.onboarding.nick_placeholder}
                    className={`w-full ${UI.COLORS.BG_INPUT} ${UI.LAYOUT.ROUNDED_MD} p-4 text-center font-bold text-lg outline-none focus:border-${UI.COLORS.PRIMARY}-500 transition-colors`}
                />
                
                <button 
                    onClick={handleJoin}
                    disabled={loading || !nickname}
                    className={`w-full py-4 bg-${UI.COLORS.PRIMARY}-600 text-white ${UI.LAYOUT.ROUNDED_MD} font-bold hover:bg-${UI.COLORS.PRIMARY}-500 disabled:opacity-50 transition-all shadow-lg active:scale-[0.98]`}
                >
                    {loading ? "..." : t.onboarding.join_btn}
                </button>
            </div>
        </div>
    )
}