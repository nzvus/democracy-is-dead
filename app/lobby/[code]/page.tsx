'use client'

import { createClient } from '@/utils/supabase/client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers/auth-provider'

import { LobbyWaiting } from '@/components/lobby/lobby-waiting'
import { LobbyVoting } from '@/components/lobby/lobby-voting'
import { LobbyResults } from '@/components/lobby/lobby-results'

export default function LobbyPage() {
  const params = useParams()
  const code = params.code as string
  const supabase = createClient()
  const { user } = useAuth()

  const [status, setStatus] = useState('waiting')
  const [lobbyId, setLobbyId] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  
  const [nickname, setNickname] = useState('')
  const [isJoined, setIsJoined] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!isJoined || !nickname || !user) return

    let channel: RealtimeChannel;

    const init = async () => {
      const { data: lobby, error } = await supabase
        .from('lobbies')
        .select('id, status, candidates(*), created_at')
        .eq('code', code)
        .single()

      if (error || !lobby) {
        toast.error("Lobby non trovata!")
        return
      }

      setLobbyId(lobby.id)
      setStatus(lobby.status)
      setCandidates(lobby.candidates || [])
      setIsAdmin(true)

      if (lobby.status === 'ended') calculateResults(lobby.id)

      const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${nickname}&backgroundColor=b6e3f4`
      
      channel = supabase.channel(`lobby-${code}`)
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState<any>()
          const list: any[] = []
          for (const key in state) if (state[key].length) list.push(state[key][0])
          setUsers(list)
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'candidates', filter: `lobby_id=eq.${lobby.id}` }, 
          (payload) => setCandidates(p => [...p, payload.new])
        )
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lobbies', filter: `id=eq.${lobby.id}` }, 
          (payload) => {
            setStatus(payload.new.status)
            if (payload.new.status === 'voting') toast.info("Votazione Aperta!")
            if (payload.new.status === 'ended') {
                toast.success("Votazione Conclusa!")
                calculateResults(lobby.id)
            }
          }
        )
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ user_id: user.id, nickname, avatar: avatarUrl })
          }
        })
    }

    init()
    return () => { if (channel) channel.unsubscribe() }
  }, [isJoined, nickname, code, user])


  const handleAddCandidate = async (name: string) => {
    if (!lobbyId) return
    await supabase.from('candidates').insert({ lobby_id: lobbyId, name })
  }

  const handleStartVoting = async () => {
    if (!lobbyId) return
    if (candidates.length < 1) return toast.error("Aggiungi almeno un candidato!")
    await supabase.from('lobbies').update({ status: 'voting' }).eq('id', lobbyId)
  }

  const handleSubmitVotes = async (votes: Record<string, number>) => {
    if (!user || !lobbyId) return

    const votesToInsert = candidates.map(c => ({
      lobby_id: lobbyId,
      voter_id: user.id,
      candidate_id: c.id,
      scores: { "Generale": votes[c.id] || 0 } 
    }))

    const { error } = await supabase.from('votes').insert(votesToInsert)
    if (error) throw error
  }

  const calculateResults = async (lid: string) => {
    const { data: allVotes } = await supabase.from('votes').select('candidate_id, scores').eq('lobby_id', lid)
    if (!allVotes) return

    const scores: Record<string, number> = {}
    allVotes.forEach((v: any) => {
      const sum = Object.values(v.scores).reduce((a: any, b: any) => a + b, 0) as number
      scores[v.candidate_id] = (scores[v.candidate_id] || 0) + sum
    })

    const { data: freshCandidates } = await supabase.from('candidates').select('*').eq('lobby_id', lid)
    const list = (freshCandidates || []).map(c => ({
      name: c.name,
      score: scores[c.id] || 0
    })).sort((a, b) => b.score - a.score)

    setResults(list)
  }

  
  if (!isJoined) return (
    <div className="flex h-screen items-center justify-center bg-gray-950 text-white p-4">
      <div className="w-full max-w-sm p-8 bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Lobby {code}</h1>
        <input 
            suppressHydrationWarning
            className="w-full bg-gray-800 p-4 rounded-xl mb-4 border border-gray-700 focus:border-indigo-500 outline-none transition-colors" 
            placeholder="Scegli il tuo Nickname" 
            value={nickname} 
            onChange={e => setNickname(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && nickname && setIsJoined(true)}
        />
        <button 
            onClick={() => nickname && setIsJoined(true)} 
            disabled={!nickname}
            className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-bold transition-all disabled:opacity-50"
        >
            ENTRA
        </button>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12 flex flex-col items-center">
      {status === 'waiting' && (
        <LobbyWaiting 
          code={code} 
          users={users} 
          candidates={candidates} 
          isAdmin={isAdmin}
          onAddCandidate={handleAddCandidate}
          onStartVoting={handleStartVoting}
        />
      )}

      {status === 'voting' && (
        <>
            <LobbyVoting 
            candidates={candidates} 
            onSubmit={handleSubmitVotes} 
            />
            {isAdmin && (
                <div className="fixed top-4 right-4 z-50">
                    <button 
    onClick={async () => {
        const { error } = await supabase
            .from('lobbies')
            .update({ status: 'ended' })
            .eq('id', lobbyId)
        
        if (error) {
            toast.error("Errore DB: " + error.message)
            console.error(error)
        } else {
            toast.success("Votazione chiusa!")
        }
    }}
    className="bg-red-600/90 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm backdrop-blur shadow-lg border border-red-400 transition-all active:scale-95"
>
    TERMINA VOTO (Admin)
                    </button>
                </div>
            )}
        </>
      )}

      {status === 'ended' && (
        <LobbyResults results={results} />
      )}
    </main>
  )
}