'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { UI } from '@/lib/constants'

// Componenti Fasi
import SetupWrapper from '@/components/lobby/setup/setup-wrapper'
import VotingWrapper from '@/components/lobby/voting/voting-wrapper'
import ResultsWrapper from '@/components/lobby/results/results-wrapper' // Percorso aggiornato

// Componenti Comuni
import LobbyOnboarding from '@/components/lobby/lobby-onboarding'
import LobbyChat from '@/components/lobby/lobby-chat'

export default function LobbyPage({ params }: { params: { code: string } }) {
  const { t } = useLanguage()
  const supabase = createClient()
  
  const [lobby, setLobby] = useState<any>(null)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [hasJoined, setHasJoined] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Computed State
  const isHost = lobby && currentUserId ? lobby.host_id === currentUserId : false

  useEffect(() => {
    const initLobby = async () => {
        // 1. Ottieni/Crea Utente Anonimo
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        let userId = session?.user?.id

        if (!userId) {
            const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
            if (anonError) {
                toast.error("Auth Error")
                return
            }
            userId = anonData.user?.id
        }
        setCurrentUserId(userId!)

        // 2. Fetch Lobby
        const { data: lobbyData, error: lobbyError } = await supabase
            .from('lobbies')
            .select('*')
            .eq('code', params.code)
            .single()

        if (lobbyError || !lobbyData) {
            setLoading(false)
            toast.error(t.home.error_lobby_not_found)
            return
        }

        setLobby(lobbyData)

        // 3. Controllo Onboarding (Partecipante esiste?)
        // Usa maybeSingle() per evitare errore 406 se l'utente non è ancora registrato
        const { data: participant } = await supabase
            .from('lobby_participants')
            .select('id')
            .eq('lobby_id', lobbyData.id)
            .eq('user_id', userId)
            .maybeSingle() 
        
        if (participant) {
            setHasJoined(true)
        }
        
        setLoading(false)
    }

    initLobby()

    // 4. Realtime Listener (Aggiorna stato lobby per tutti)
    const channel = supabase.channel('lobby_status_updates')
        .on(
            'postgres_changes', 
            { event: 'UPDATE', schema: 'public', table: 'lobbies', filter: `code=eq.${params.code}` },
            (payload) => {
                setLobby((prev: any) => ({ ...prev, ...payload.new }))
            }
        )
        .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [params.code, supabase, t])

  // --- RENDERING ---

  if (loading) {
      return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white gap-4">
            <div className={`w-12 h-12 border-4 border-${UI.COLORS.PRIMARY}-500 border-t-transparent rounded-full animate-spin`}></div>
            <p className="text-gray-500 font-mono text-sm animate-pulse">{t.common.loading}</p>
        </div>
      )
  }

  if (!lobby) {
      return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
             <h1 className="text-4xl font-bold mb-4">404</h1>
             <p className="text-gray-400">{t.home.error_lobby_not_found}</p>
             <a href="/" className="mt-8 text-indigo-400 hover:text-white underline">{t.common.back}</a>
        </div>
      )
  }

  // 1. Se l'utente non è ancora entrato -> Mostra Onboarding
  if (!hasJoined) {
    return <LobbyOnboarding lobby={lobby} userId={currentUserId} onJoin={() => setHasJoined(true)} />

  }

  // 2. Switch Contenuto Principale in base allo Status
  let content = null
  if (lobby.status === 'setup') {
    // Setup (Candidati & Fattori) - Editabile da tutti per ora (o solo host se vuoi restringere)
    content = <SetupWrapper lobby={lobby} userId={currentUserId} />
  } else if (lobby.status === 'voting') {
    // Votazione
    content = <VotingWrapper lobby={lobby} userId={currentUserId} isHost={isHost} />
  } else if (lobby.status === 'ended') {
    // Risultati (Passiamo isHost per il tasto Riapri)
    content = <ResultsWrapper lobby={lobby} isHost={isHost} />
  }

  return (
    <>
        {content}
        
        {/* Chat sempre visibile (tranne in onboarding) */}
        <LobbyChat lobbyId={lobby.id} userId={currentUserId} />
    </>
  )
}