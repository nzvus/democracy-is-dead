'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/client'
// import { useRouter } from 'next/navigation' 
import Link from 'next/link'
import { useLanguage } from '@/components/providers/language-provider'
import { UI } from '@/lib/constants'

// Components
import LobbyOnboarding from '@/components/lobby/lobby-onboarding'
import SetupWrapper from '@/components/lobby/setup/setup-wrapper'
import VotingWrapper from '@/components/lobby/voting/voting-wrapper'
import ResultsWrapper from '@/components/lobby/results/results-wrapper'
import LobbyChat from '@/components/lobby/lobby-chat'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { Factor } from '@/types'

// Definiamo un tipo che soddisfi tutti i wrapper
interface LobbyData {
  id: string
  code: string
  host_id: string
  status: 'waiting' | 'setup' | 'voting' | 'ended'
  // Usiamo una definizione compatibile con Setup/Voting wrapper
  settings: {
      factors: Factor[];
      voting_scale?: { max: number };
      allow_decimals?: boolean;
  }
  created_at: string
}

export default function LobbyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const { t } = useLanguage()
  const supabase = createClient()

  const [lobby, setLobby] = useState<LobbyData | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [nickname, setNickname] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      // 1. Get User
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      let currentUserId = user?.id

      if (authError || !currentUserId) {
        const { data: anonUser } = await supabase.auth.signInAnonymously()
        currentUserId = anonUser.user?.id
      }
      setUserId(currentUserId || null)

      if (!currentUserId) return

      // 2. Get Lobby
      const { data: lobbyData, error: lobbyError } = await supabase
        .from('lobbies')
        .select('*')
        .eq('code', code)
        .single()

      if (lobbyError || !lobbyData) {
        setLoading(false)
        return
      }

      // Safe cast: assicuriamoci che settings abbia factors array
      const safeLobby: LobbyData = {
          ...lobbyData,
          settings: {
              factors: lobbyData.settings?.factors || [],
              voting_scale: lobbyData.settings?.voting_scale,
              allow_decimals: lobbyData.settings?.allow_decimals
          }
      }

      setLobby(safeLobby)

      // 3. Check Participant
      const { data: participant } = await supabase
        .from('lobby_participants')
        .select('nickname')
        .eq('lobby_id', lobbyData.id)
        .eq('user_id', currentUserId)
        .maybeSingle()

      if (participant) setNickname(participant.nickname)
      setLoading(false)
    }

    init()
  }, [code, supabase])

  // Realtime Subscription
  useEffect(() => {
    if (!lobby) return

    const channel = supabase.channel(`lobby_${lobby.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'lobbies', filter: `id=eq.${lobby.id}` },
        (payload: RealtimePostgresChangesPayload<LobbyData>) => {
           if (payload.new && 'status' in payload.new) {
               // Aggiorniamo mantenendo la struttura sicura
               setLobby(prev => prev ? ({ ...prev, ...payload.new } as LobbyData) : null)
           }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [lobby?.id, supabase, lobby])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    )
  }

  if (!lobby) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white gap-6">
        <h1 className="text-4xl font-black text-red-500">404</h1>
        <p className="text-gray-400">Lobby not found.</p>
        <Link href="/" className={`px-6 py-3 bg-${UI.COLORS.PRIMARY}-600 rounded-full font-bold hover:opacity-90`}>
           Go Home
        </Link>
      </div>
    )
  }

  if (!nickname) {
    return <LobbyOnboarding lobbyId={lobby.id} userId={userId!} onJoin={(nick: string) => setNickname(nick)} />
  }

  const isHost = userId === lobby.host_id

  return (
    <>
      {lobby.status === 'waiting' && (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-6 text-center space-y-6">
            <h1 className="text-3xl font-bold">{t.lobby.status_waiting}</h1>
            <p className="text-gray-400 max-w-md">{t.lobby.guest_desc}</p>
            {isHost && (
                <button 
                    onClick={() => supabase.from('lobbies').update({ status: 'setup' }).eq('id', lobby.id)}
                    className={`px-8 py-4 bg-${UI.COLORS.PRIMARY}-600 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform`}
                >
                    Start Setup 🚀
                </button>
            )}
            <LobbyChat lobbyId={lobby.id} userId={userId!} />
        </div>
      )}

      {lobby.status === 'setup' && (
         isHost ? <SetupWrapper lobby={lobby} /> : (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
                <h2 className="text-2xl font-bold animate-pulse">{t.lobby.status_setup}</h2>
                <p className="text-gray-500 mt-2">The host is configuring the candidates...</p>
                <LobbyChat lobbyId={lobby.id} userId={userId!} />
            </div>
         )
      )}

      {lobby.status === 'voting' && (
        <>
            <VotingWrapper lobby={lobby} userId={userId!} isHost={isHost} />
            <LobbyChat lobbyId={lobby.id} userId={userId!} />
        </>
      )}

      {lobby.status === 'ended' && (
        <>
            <ResultsWrapper lobby={lobby} userId={userId!} isHost={isHost} />
            <LobbyChat lobbyId={lobby.id} userId={userId!} />
        </>
      )}
    </>
  )
}