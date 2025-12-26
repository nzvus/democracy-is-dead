'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation' 
import { createClient } from '@/lib/client'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { UI } from '@/lib/constants'

import SetupWrapper from '@/components/lobby/setup/setup-wrapper'
import VotingWrapper from '@/components/lobby/voting/voting-wrapper'
import ResultsWrapper from '@/components/lobby/results/results-wrapper'

import LobbyOnboarding from '@/components/lobby/lobby-onboarding'
import LobbyChat from '@/components/lobby/lobby-chat'

export default function LobbyPage() { 
  const { t } = useLanguage()
  const supabase = createClient()
  
  const params = useParams()
  const lobbyCode = params?.code as string

  const [lobby, setLobby] = useState<any>(null)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [hasJoined, setHasJoined] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const isHost = lobby && currentUserId ? lobby.host_id === currentUserId : false

  useEffect(() => {
    if (!lobbyCode) return

    const initLobby = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        let userId = session?.user?.id

        if (!userId) {
            const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
            if (anonError) {
                console.error("Auth Error:", anonError)
                return
            }
            userId = anonData.user?.id
        }
        setCurrentUserId(userId!)

        const { data: lobbyData, error: lobbyError } = await supabase
            .from('lobbies')
            .select('*')
            .eq('code', lobbyCode) 
            .single()

        if (lobbyError || !lobbyData) {
            setLoading(false)
            
            console.error("Lobby not found or error:", lobbyError)
            return
        }

        setLobby(lobbyData)

        
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

    
    const channel = supabase.channel('lobby_status_updates')
        .on(
            'postgres_changes', 
            { event: 'UPDATE', schema: 'public', table: 'lobbies', filter: `code=eq.${lobbyCode}` },
            (payload) => {
                setLobby((prev: any) => ({ ...prev, ...payload.new }))
            }
        )
        .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [lobbyCode, supabase]) 

  

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

  if (!hasJoined) {
      return <LobbyOnboarding lobby={lobby} userId={currentUserId} onJoin={() => setHasJoined(true)} />
  }

  let content = null
  if (lobby.status === 'setup') {
    content = <SetupWrapper lobby={lobby} userId={currentUserId} />
  } else if (lobby.status === 'voting') {
    content = <VotingWrapper lobby={lobby} userId={currentUserId} isHost={isHost} />
  } else if (lobby.status === 'ended') {
content = <ResultsWrapper lobby={lobby} isHost={isHost} userId={currentUserId} /> 
  }

  return (
    <>
        {content}
        <LobbyChat lobbyId={lobby.id} userId={currentUserId} />
    </>
  )
}