'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'

// --- IMPORT COMPONENTI FASI ---
import LobbyOnboarding from '@/components/lobby/lobby-onboarding'
import SetupWrapper from '@/components/lobby/setup/setup-wrapper'
import VotingWrapper from '@/components/lobby/voting/voting-wrapper' // Il nuovo componente unificato
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
  
  // Stato per verificare se l'utente ha scelto il nickname
  const [hasJoined, setHasJoined] = useState(false)

  useEffect(() => {
    const initLobby = async () => {
      try {
        // 1. AUTENTICAZIONE & USER ID
        const { data: { user } } = await supabase.auth.getUser()
        let currentUserId = user?.id

        // Se arriva da link diretto, crea utente anonimo
        if (!currentUserId) {
            const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
            if (anonError) throw anonError
            currentUserId = anonData.user?.id
        }
        setUserId(currentUserId!)

        // 2. RECUPERA LOBBY
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
        
        // 3. CONTROLLA SE È HOST
        if (currentUserId && lobbyData.host_id === currentUserId) {
          setIsHost(true)
        }

        // 4. CONTROLLA SE HA GIÀ FATTO ONBOARDING (NICKNAME)
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

    // 5. REALTIME (Ascolta cambi di stato Setup -> Voto -> Fine)
    const channel = supabase
      .channel('lobby_main_channel')
      .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'lobbies', filter: `code=eq.${params.code}` }, 
          (payload) => setLobby(payload.new)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [params.code, router, supabase])

  // --- RENDER: LOADING ---
  if (loading) {
    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-10">
            <div className="animate-spin text-4xl mb-4 text-indigo-500">⏳</div>
        </div>
    )
  }

  // --- RENDER: ONBOARDING (BLOCCANTE) ---
  // Se non ha ancora scelto il nick, mostra SOLO questo.
  if (!hasJoined && userId && lobby) {
      return <LobbyOnboarding lobby={lobby} userId={userId} onJoin={() => setHasJoined(true)} />
  }

  // --- RENDER: FASI DI GIOCO ---
  let content = null;

  if (lobby.status === 'setup') {
    // FASE 1: CONFIGURAZIONE
    if (isHost) {
        content = <SetupWrapper lobby={lobby} userId={userId!} />;
    } else {
        // Schermata di attesa per ospiti (Tradotta)
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
    // FASE 3: RISULTATI
    content = <LobbyResults lobby={lobby} />;
  } else {
    // FASE 2: VOTO
    // Qui usiamo il nuovo wrapper unificato (Mobile/Desktop)
    content = <VotingWrapper lobby={lobby} userId={userId!} />;
  }

  return (
    <>
      {content}
      
      {/* CHAT: Visibile sempre, ma solo DOPO aver fatto il join (serve il nick) */}
      {userId && hasJoined && <LobbyChat lobbyId={lobby.id} userId={userId} />}
    </>
  )
}