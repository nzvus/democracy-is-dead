'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { UI } from '@/lib/constants'

// Componenti Fasi
import LobbyOnboarding from '@/components/lobby/lobby-onboarding'
import SetupWrapper from '@/components/lobby/setup/setup-wrapper'
import VotingWrapper from '@/components/lobby/voting/voting-wrapper'
import LobbyResults from '@/components/lobby/lobby-results'
import LobbyChat from '@/components/lobby/lobby-chat'

export default function LobbyPage() {
  const { t } = useLanguage()
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [lobby, setLobby] = useState<any>(null)
  const [isHost, setIsHost] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [hasJoined, setHasJoined] = useState(false)

  useEffect(() => {
    const initLobby = async () => {
      try {
        // 1. Auth & User ID
        const { data: { user } } = await supabase.auth.getUser()
        let currentUserId = user?.id

        if (!currentUserId) {
            const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
            if (anonError) throw anonError
            currentUserId = anonData.user?.id
        }
        setUserId(currentUserId!)

        // 2. Recupera Lobby
        const { data: lobbyData, error } = await supabase
          .from('lobbies')
          .select('*')
          .eq('code', params.code)
          .single()

        if (error || !lobbyData) {
          toast.error(t.home.error_lobby_not_found)
          router.push('/')
          return
        }
        setLobby(lobbyData)
        
        // 3. Controlli Ruolo (Host)
        if (currentUserId && lobbyData.host_id === currentUserId) {
          setIsHost(true)
        }

        // 4. Controllo Onboarding (Partecipante esiste?)
        const { data: participant } = await supabase
            .from('lobby_participants')
            .select('id')
            .eq('lobby_id', lobbyData.id)
            .eq('user_id', currentUserId)
            .single()
        
        if (participant) {
            setHasJoined(true)
        }
        
        setLoading(false)

      } catch (err: any) {
        console.error("Lobby Init Error:", err)
        router.push('/')
      }
    }

    initLobby()

    // 5. Realtime Updates (Cambio stato lobby)
    const channel = supabase
      .channel('lobby_main_channel')
      .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'lobbies', filter: `code=eq.${params.code}` }, 
          (payload) => setLobby(payload.new)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [params.code, router, supabase, t])

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-10">
            <div className={`animate-spin text-4xl mb-4 text-${UI.COLORS.PRIMARY}-500`}>⏳</div>
        </div>
    )
  }

  // FASE 0: ONBOARDING (Nome & Avatar)
  if (!hasJoined && userId && lobby) {
      return <LobbyOnboarding lobby={lobby} userId={userId} onJoin={() => setHasJoined(true)} />
  }

  // ROUTING STATI DI GIOCO
  let content = null;

  if (lobby.status === 'setup') {
    if (isHost) {
        content = <SetupWrapper lobby={lobby} userId={userId!} />;
    } else {
        // Vista Ospite durante il setup
        content = (
            <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center">
                 <div className={`max-w-md w-full ${UI.COLORS.BG_CARD} p-8 ${UI.LAYOUT.ROUNDED_LG} backdrop-blur-sm shadow-2xl animate-in zoom-in-95`}>
                     <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto animate-pulse border border-gray-700">
                        ⚙️
                     </div>
                     <h1 className="text-2xl font-bold mb-2">{t.lobby.guest_title}</h1>
                     <p className="text-gray-400 text-sm mb-8 leading-relaxed">{t.lobby.guest_desc}</p>
                     
                     <div className="bg-black/20 rounded-xl p-4 border border-gray-800/50">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">{t.lobby.status_label}</p>
                        <p className={`text-${UI.COLORS.PRIMARY}-400 font-mono text-sm font-bold`}>{t.lobby.status_waiting}</p>
                     </div>
                 </div>
            </div>
        );
    }
  } else if (lobby.status === 'ended') {
    content = <LobbyResults lobby={lobby} />;
  } else {
    // FASE VOTO
    content = <VotingWrapper lobby={lobby} userId={userId!} isHost={isHost} />;
  }

  return (
    <>
      {content}
      {/* La chat è sempre disponibile se l'utente è entrato */}
      {userId && hasJoined && <LobbyChat lobbyId={lobby.id} userId={userId} />}
    </>
  )
}