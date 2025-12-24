'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'

// --- IMPORT DEI COMPONENTI ---
// 1. Nuovo Admin Setup Modulare
import SetupWrapper from '@/components/lobby/setup/setup-wrapper'
// 2. Componenti esistenti (Li rifaremo nel prossimo step, ma ora servono)
import LobbyWaiting from '@/components/lobby/lobby-waiting'
import LobbyResults from '@/components/lobby/lobby-results'
import LobbyChat from '@/components/lobby/lobby-chat'

export default function LobbyPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [lobby, setLobby] = useState<any>(null)
  const [isHost, setIsHost] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const initLobby = async () => {
      try {
        // 1. GESTIONE IDENTITÀ (Fix per Link Diretti)
        const { data: { user } } = await supabase.auth.getUser()
        let currentUserId = user?.id

        // Se l'utente non esiste, creiamolo anonimo al volo
        if (!currentUserId) {
            const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
            if (anonError) throw anonError
            currentUserId = anonData.user?.id
        }
        
        setUserId(currentUserId!)

        // 2. RECUPERO DATI LOBBY
        const { data: lobbyData, error } = await supabase
          .from('lobbies')
          .select('*')
          .eq('code', params.code)
          .single()

        if (error || !lobbyData) {
          toast.error("Lobby non trovata o scaduta!")
          router.push('/') // Rimanda alla home
          return
        }

        setLobby(lobbyData)
        
        // 3. SEI L'ADMIN?
        if (currentUserId && lobbyData.host_id === currentUserId) {
          setIsHost(true)
        }
        
        setLoading(false)

      } catch (err: any) {
        console.error("Lobby Init Error:", err)
        toast.error("Errore di connessione al server.")
        router.push('/')
      }
    }

    initLobby()

    // 4. REALTIME: Ascolta cambiamenti di stato (Setup -> Voting -> Ended)
    const channel = supabase
      .channel('lobby_main_channel')
      .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'lobbies', filter: `code=eq.${params.code}` }, 
          (payload) => {
             // Aggiorna lo stato locale istantaneamente
             setLobby(payload.new)
          }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [params.code, router, supabase])

  // --- RENDER: LOADING ---
  if (loading) {
    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-10">
            <div className="animate-spin text-4xl mb-4 text-indigo-500">⏳</div>
            <p className="animate-pulse text-sm font-mono text-gray-400">Syncing protocol...</p>
        </div>
    )
  }

  // --- RENDER: LOGICA DI STATO ---
  let content = null;

  if (lobby.status === 'setup') {
    // FASE 1: SETUP
    if (isHost) {
        // L'Admin vede il nuovo pannello modulare
        content = <SetupWrapper lobby={lobby} userId={userId!} />;
    } else {
        // L'Ospite vede una "Waiting Room" curata
        content = (
            <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center">
                 <div className="max-w-md w-full bg-gray-900/50 border border-gray-800 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">
                     <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-3xl mb-6 mx-auto animate-pulse border border-gray-700">
                        ⚙️
                     </div>
                     <h1 className="text-2xl font-bold mb-2">Lavori in Corso</h1>
                     <p className="text-gray-400 text-sm mb-6">
                        L'Host sta configurando i candidati e le regole della votazione.
                     </p>
                     
                     <div className="bg-black/20 rounded-xl p-4 border border-gray-800/50">
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">STATUS</p>
                        <p className="text-indigo-400 font-mono text-sm">In attesa dell'avvio...</p>
                     </div>
                 </div>
            </div>
        );
    }
  } else if (lobby.status === 'ended') {
    // FASE 3: RISULTATI
    content = <LobbyResults lobby={lobby} />;
  } else {
    // FASE 2: VOTAZIONE (Voting)
    // Nota: Presto rifaremo anche questo file per usare la Grid View
    content = <LobbyWaiting lobby={lobby} isHost={isHost} />;
  }

  // --- RENDER: LAYOUT FINALE ---
  return (
    <>
      {content}
      
      {/* La chat è un overlay globale, visibile in tutte le fasi se l'utente ha un ID */}
      {userId && <LobbyChat lobbyId={lobby.id} userId={userId} />}
    </>
  )
}