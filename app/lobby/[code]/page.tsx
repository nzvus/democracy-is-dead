'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider' // Import t

// Import Componenti
import SetupWrapper from '@/components/lobby/setup/setup-wrapper'
import LobbyWaiting from '@/components/lobby/lobby-waiting'
import LobbyResults from '@/components/lobby/lobby-results'
import LobbyChat from '@/components/lobby/lobby-chat'
import LobbyOnboarding from '@/components/lobby/lobby-onboarding' // <--- NUOVO

export default function LobbyPage() {
  const { t } = useLanguage() // Usa le traduzioni
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [lobby, setLobby] = useState<any>(null)
  const [isHost, setIsHost] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  
  // Nuovo stato: l'utente ha completato il profilo?
  const [hasJoined, setHasJoined] = useState(false)

  useEffect(() => {
    const initLobby = async () => {
      try {
        // 1. AUTH & USER ID
        const { data: { user } } = await supabase.auth.getUser()
        let currentUserId = user?.id

        if (!currentUserId) {
            const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
            if (anonError) throw anonError
            currentUserId = anonData.user?.id
        }
        setUserId(currentUserId!)

        // 2. FETCH LOBBY
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
        
        // 3. CHECK HOST
        if (currentUserId && lobbyData.host_id === currentUserId) {
          setIsHost(true)
        }

        // 4. CHECK PARTECIPANTE (Ha già un nick?)
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
        console.error("Init Error:", err)
        router.push('/')
      }
    }

    initLobby()

    // REALTIME LOBBY STATUS
    const channel = supabase
      .channel('lobby_main')
      .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'lobbies', filter: `code=eq.${params.code}` }, 
          (payload) => setLobby(payload.new)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [params.code, router, supabase])

  // --- RENDER ---

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-10">
            <div className="animate-spin text-4xl mb-4 text-indigo-500">⏳</div>
        </div>
    )
  }

  // BLOCCANTE: Se non ha fatto join, mostra Onboarding
  if (!hasJoined && userId && lobby) {
      return <LobbyOnboarding lobby={lobby} userId={userId} onJoin={() => setHasJoined(true)} />
  }

  // --- CONTENUTO NORMALE (Setup / Voting / Results) ---
  let content = null;

  if (lobby.status === 'setup') {
    if (isHost) {
        content = <SetupWrapper lobby={lobby} userId={userId!} />;
    } else {
        // Waiting Room Ospiti (Migliorata con traduzioni)
        content = (
            <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center">
                 <div className="max-w-md w-full bg-gray-900/50 border border-gray-800 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">
                     <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-3xl mb-6 mx-auto animate-pulse border border-gray-700">
                        ⚙️
                     </div>
                     <h1 className="text-2xl font-bold mb-2">{t.lobby.guest_title}</h1>
                     <p className="text-gray-400 text-sm mb-6">{t.lobby.guest_desc}</p>
                     
                     <div className="bg-black/20 rounded-xl p-4 border border-gray-800/50">
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">{t.lobby.status_label}</p>
                        <p className="text-indigo-400 font-mono text-sm">{t.lobby.status_waiting}</p>
                     </div>
                 </div>
            </div>
        );
    }
  } else if (lobby.status === 'ended') {
    content = <LobbyResults lobby={lobby} />;
  } else {
    // Voting Phase
    content = <LobbyWaiting lobby={lobby} isHost={isHost} />;
  }

  return (
    <>
      {content}
      {/* Chat visibile solo dopo il Join */}
      {userId && hasJoined && <LobbyChat lobbyId={lobby.id} userId={userId} />}
    </>
  )
}