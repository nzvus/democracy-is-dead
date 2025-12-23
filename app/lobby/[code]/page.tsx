'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'

// Import dei componenti creati
import LobbySetup from '@/components/lobby/lobby-setup'
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
        // 1. AUTENTICAZIONE AUTOMATICA (Fix Link Diretto)
        // Se arrivo da un link, potrei non avere una sessione. La creiamo al volo.
        const { data: { user } } = await supabase.auth.getUser()
        let currentUserId = user?.id

        if (!currentUserId) {
            const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
            if (anonError) throw anonError
            currentUserId = anonData.user?.id
        }
        
        // Salviamo l'ID (servirà per la Chat e per capire se sono Host)
        setUserId(currentUserId!)

        // 2. SCARICA DATI LOBBY
        const { data: lobbyData, error } = await supabase
          .from('lobbies')
          .select('*')
          .eq('code', params.code)
          .single()

        if (error || !lobbyData) {
          toast.error("Lobby non trovata o scaduta!")
          router.push('/') // Torna alla home
          return
        }

        setLobby(lobbyData)
        
        // 3. SEI L'ADMIN?
        if (currentUserId && lobbyData.host_id === currentUserId) {
          setIsHost(true)
        }
        
        setLoading(false)

      } catch (err: any) {
        console.error("Errore init:", err)
        toast.error("Errore di connessione")
        router.push('/')
      }
    }

    initLobby()

    // 4. REALTIME: Ascolta i cambiamenti di stato (es. Setup -> Voting)
    const channel = supabase
      .channel('lobby_status_updates')
      .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'lobbies', filter: `code=eq.${params.code}` }, 
          (payload) => {
             // Aggiorna lo stato locale con i nuovi dati dal server
             setLobby(payload.new)
          }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [params.code, router, supabase])

  // --- RENDER ---

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-10">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="animate-pulse">Connessione al protocollo sicuro...</p>
        </div>
    )
  }

  // DEFINIAMO IL CONTENUTO PRINCIPALE IN BASE ALLO STATO
  let content = null;

  if (lobby.status === 'setup') {
    // FASE 1: CONFIGURAZIONE
    if (isHost) {
        // L'Admin vede il pannello di controllo
        content = <LobbySetup lobby={lobby} userId={userId!} />;
    } else {
        // L'Ospite vede una sala d'attesa
        content = (
            <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 text-center">
                 <div className="animate-bounce text-6xl mb-6">🚧</div>
                 <h1 className="text-3xl font-bold mb-4">Lavori in Corso</h1>
                 <p className="text-gray-400 max-w-md mx-auto">
                    L'Host sta configurando i candidati e i criteri di voto.
                    Mettiti comodo, la pagina si aggiornerà automaticamente appena si parte.
                 </p>
            </div>
        );
    }
  } else if (lobby.status === 'ended') {
    // FASE 3: RISULTATI
    content = <LobbyResults lobby={lobby} />;
  } else {
    // FASE 2: VOTO (Status 'voting' o fallback)
    content = <LobbyWaiting lobby={lobby} isHost={isHost} />;
  }

  // RITORNIAMO IL LAYOUT COMPLETO (Contenuto + Chat sovrapposta)
  return (
    <>
      {content}
      
      {/* La chat è sempre presente, ma solo se abbiamo un utente valido */}
      {userId && <LobbyChat lobbyId={lobby.id} userId={userId} />}
    </>
  )
}