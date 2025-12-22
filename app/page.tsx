'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner' // Usiamo le notifiche carine

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const createLobby = async () => {
    setLoading(true)
    const toastId = toast.loading("Creazione lobby in corso...") // Feedback immediato

    try {
      // 1. Assicuriamoci che l'utente sia loggato (anche anonimo)
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      let userId = user?.id

      if (authError || !userId) {
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
        if (anonError) throw anonError
        userId = anonData.user?.id
      }

      // 2. Genera codice univoco
      const code = Math.floor(1000 + Math.random() * 9000).toString()

      // 3. Inserimento nel DB
      // Nota: Qui inseriamo settings di base. 
      // I fattori complessi e la privacy li configurerai DOPO, nella dashboard Admin.
      const { data, error } = await supabase
        .from('lobbies')
        .insert([
          { 
            code, 
            host_id: userId, // Importante: salviamo chi è il capo
            status: 'waiting',
            settings: { 
                algorithm: 'schulze', 
                privacy: 'public', // Default
                factors: [] // Default vuoto, lo riempiamo dopo
            } 
          }
        ])
        .select()
        .single()

      if (error) throw error

      // 4. SUCCESSO & REDIRECT
      toast.dismiss(toastId)
      toast.success("Lobby creata!")
      router.push(`/lobby/${data.code}`) // <--- ECCO IL REDIRECT CHE MANCAVA

    } catch (err: any) {
      console.error(err)
      toast.dismiss(toastId)
      toast.error("Errore creazione: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-950 text-white relative overflow-hidden">
      
      {/* Sfondo decorativo (opzionale) */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-950 to-gray-950 -z-10"></div>

      <div className="max-w-2xl w-full text-center space-y-8 z-10">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent drop-shadow-sm">
          Democracy<br/>is Dead 💀
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 text-balance max-w-lg mx-auto leading-relaxed">
          Il voto tradizionale è matematicamente rotto. <br/>
          Noi usiamo il <span className="text-indigo-400 font-bold">Metodo Schulze</span> per trovare la verità.
        </p>
        
        <div className="pt-8">
          <button
            onClick={createLobby}
            disabled={loading}
            className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-lg shadow-xl shadow-indigo-900/20 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 mx-auto"
          >
            {loading ? (
                <>Creazione...</>
            ) : (
                <>⚗️ Crea Nuova Lobby</>
            )}
          </button>
          
          <p className="mt-4 text-xs text-gray-600 uppercase tracking-widest">
            Nessuna registrazione richiesta
          </p>
        </div>
      </div>
    </main>
  )
}