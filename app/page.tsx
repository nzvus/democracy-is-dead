'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const createLobby = async () => {
    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInAnonymously()
      if (authError) throw authError

      const code = Math.floor(1000 + Math.random() * 9000).toString()

      const { data, error } = await supabase
        .from('lobbies')
        .insert([
          { 
            code, 
            settings: { algorithm: 'schulze', factors: [] } 
          }
        ])
        .select()
        .single()

      if (error) throw error

      alert(`Lobby creata con successo! Codice: ${data.code}`)
      console.log("Lobby creata:", data)

    } catch (err: any) {
      console.error(err)
      alert("Errore: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-950 text-white">
      <h1 className="text-4xl font-bold mb-8">Democracy is Dead 💀</h1>
      <p className="mb-8 text-gray-400">Il voto è inutile, ma almeno divertiamoci.</p>
      
      <button
        onClick={createLobby}
        disabled={loading}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold transition-all disabled:opacity-50"
      >
        {loading ? 'Creazione in corso...' : 'Crea Nuova Lobby'}
      </button>
    </main>
  )
}