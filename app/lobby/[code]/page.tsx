'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import LobbySetup from '@/components/lobby/lobby-setup' 
import LobbyWaiting from '@/components/lobby/lobby-waiting'
import LobbyResults from '@/components/lobby/lobby-results'

export default function LobbyPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [lobby, setLobby] = useState<any>(null)
  const [isHost, setIsHost] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchLobbyData = async () => {
      // 1. Chi sono io?
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)

      // 2. Scarica dati Lobby
      const { data: lobbyData, error } = await supabase
        .from('lobbies')
        .select('*')
        .eq('code', params.code)
        .single()

      if (error || !lobbyData) {
        toast.error("Lobby non trovata!")
        router.push('/')
        return
      }

      setLobby(lobbyData)
      
      // 3. Sono io il capo?
      if (user && lobbyData.host_id === user.id) {
        setIsHost(true)
      }
      
      setLoading(false)
    }

    fetchLobbyData()

    // Iscrizione Realtime (per sapere se l'admin cambia fase)
    const channel = supabase
      .channel('lobby_updates')
      .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'lobbies', filter: `code=eq.${params.code}` }, 
          (payload) => {
             setLobby(payload.new)
          }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [params.code, router, supabase])

  if (loading) return <div className="p-10 text-white text-center">Caricamento protocolli...</div>

  // --- LOGICA DI VISUALIZZAZIONE ---

  // SEZIONE 1: Fase di SETUP (Configurazione)
  if (lobby.status === 'setup') {
    if (isHost) {
        // Se sono Admin, vedo il pannello di controllo
        return <LobbySetup lobby={lobby} userId={userId!} />
    } else {
        // Se sono Ospite ma l'admin sta ancora configurando
        return (
            <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-3xl font-bold mb-4">🚧 Lavori in corso 🚧</h1>
                <p className="text-gray-400">L'Host sta configurando l'elezione (Candidati e Regole).</p>
                <p className="text-sm text-gray-600 mt-4 animate-pulse">Resta qui, si aggiornerà da solo.</p>
            </div>
        )
    }
  }

  // SEZIONE 3: Risultati Finali
  if (lobby.status === 'ended') {
    return <LobbyResults lobby={lobby} />
  }

  // SEZIONE 4 (Fallback): Fase di Attesa/Voto
  return <LobbyWaiting lobby={lobby} isHost={isHost} />

  // SEZIONE 2: Altre fasi (Waiting, Voting, ecc.) - Per ora usiamo il vecchio componente
  return <LobbyWaiting lobby={lobby} isHost={isHost} />
}