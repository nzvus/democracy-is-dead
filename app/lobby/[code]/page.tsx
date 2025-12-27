'use client'

import { useEffect, useState, use, useRef } from 'react'
import { createClient } from '@/lib/client'
import Link from 'next/link'
import { useLanguage } from '@/components/providers/language-provider'
import { UI } from '@/lib/constants'
import { Crown, Users, Loader2 } from 'lucide-react'

// Components
import LobbyOnboarding from '@/components/lobby/lobby-onboarding'
import SetupWrapper from '@/components/lobby/setup/setup-wrapper'
import VotingWrapper from '@/components/lobby/voting/voting-wrapper'
import ResultsWrapper from '@/components/lobby/results/results-wrapper'
import LobbyChat from '@/components/lobby/lobby-chat'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { Factor } from '@/types'

interface LobbyData {
  id: string
  code: string
  host_id: string
  status: 'waiting' | 'setup' | 'voting' | 'ended'
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
  const [participantCount, setParticipantCount] = useState(0)
  
  // Ref per evitare doppi trigger dell'autosetup in Strict Mode
  const autoSetupTriggered = useRef(false)

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

      const safeLobby: LobbyData = {
          ...lobbyData,
          settings: {
              factors: lobbyData.settings?.factors || [],
              voting_scale: lobbyData.settings?.voting_scale,
              allow_decimals: lobbyData.settings?.allow_decimals
          }
      }

      setLobby(safeLobby)

      // 3. Check Participant & Count
      const { data: participants } = await supabase
        .from('lobby_participants')
        .select('nickname, user_id')
        .eq('lobby_id', lobbyData.id)

      if (participants) {
          setParticipantCount(participants.length)
          const myParticipant = participants.find(p => p.user_id === currentUserId)
          if (myParticipant) setNickname(myParticipant.nickname)
      }
      
      setLoading(false)
    }

    init()
  }, [code, supabase])

  // Realtime Subscription
  useEffect(() => {
    if (!lobby) return

    const lobbyChannel = supabase.channel(`lobby_${lobby.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'lobbies', filter: `id=eq.${lobby.id}` },
        (payload: RealtimePostgresChangesPayload<LobbyData>) => {
           if (payload.new && 'status' in payload.new) {
               setLobby(prev => prev ? ({ ...prev, ...payload.new } as LobbyData) : null)
           }
        }
      )
      .subscribe()

    const partsChannel = supabase.channel(`parts_${lobby.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lobby_participants', filter: `lobby_id=eq.${lobby.id}` }, 
        () => {
            supabase.from('lobby_participants').select('id', { count: 'exact' }).eq('lobby_id', lobby.id)
                .then(({ count }) => setParticipantCount(count || 0))
        }
      )
      .subscribe()

    return () => { 
        supabase.removeChannel(lobbyChannel) 
        supabase.removeChannel(partsChannel)
    }
  }, [lobby?.id, supabase, lobby])

  const isHost = userId === lobby?.host_id

  // -----------------------------------------------------------
  // AUTO-START SETUP FIX
  // -----------------------------------------------------------
  useEffect(() => {
      const handleAutoSetup = async () => {
          if (!lobby || !nickname || !isHost) return
          
          if (lobby.status === 'waiting' && !autoSetupTriggered.current) {
              autoSetupTriggered.current = true
              
              // 1. Aggiornamento Ottimistico Locale (FIX INFINITE LOADING)
              setLobby(prev => prev ? { ...prev, status: 'setup' } : null)

              // 2. Aggiornamento DB
              await supabase.from('lobbies').update({ status: 'setup' }).eq('id', lobby.id)
          }
      }

      handleAutoSetup()
  }, [lobby?.status, isHost, nickname, lobby?.id, supabase, lobby])


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
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

  // ONBOARDING
  if (!nickname) {
    return <LobbyOnboarding lobbyId={lobby.id} userId={userId!} onJoin={(nick: string) => setNickname(nick)} />
  }

  return (
    <>
      {lobby.status === 'waiting' && (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
            
            {/* Se sei Host, loader con testo da dizionario */}
            {isHost ? (
                <div className="z-10 flex flex-col items-center gap-4 animate-in fade-in">
                    <Loader2 size={64} className="text-indigo-500 animate-spin" />
                    <h2 className="text-xl font-bold">{t.lobby.loading_setup}</h2>
                </div>
            ) : (
                // GUEST VIEW
                <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-lg">
                    <div className="w-24 h-24 bg-gray-900 rounded-3xl border border-gray-800 flex items-center justify-center shadow-2xl mb-4">
                        <Loader2 size={48} className="text-indigo-500 animate-spin-slow" />
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-4xl font-black tracking-tight">{t.lobby.status_waiting}</h1>
                        <p className="text-gray-400 text-lg">{t.lobby.guest_desc}</p>
                    </div>

                    <div className="bg-gray-900/50 px-6 py-3 rounded-full border border-gray-800 flex items-center gap-3">
                        <Users size={18} className="text-gray-400" />
                        <span className="font-mono font-bold text-lg">{participantCount}</span>
                        <span className="text-xs text-gray-500 uppercase tracking-widest">{t.lobby.participants_tab}</span>
                    </div>
                </div>
            )}
            
            <LobbyChat lobbyId={lobby.id} userId={userId!} />
        </div>
      )}

      {lobby.status === 'setup' && (
         isHost ? <SetupWrapper lobby={lobby} /> : (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-6">
                <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Crown size={32} className="text-gray-600" />
                </div>
                <h2 className="text-3xl font-bold text-center">{t.lobby.status_setup}</h2>
                <p className="text-gray-500 mt-4 text-center max-w-md">{t.lobby.setup_desc}</p>
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