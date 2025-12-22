'use client'

import { useState } from 'react'
import { Plus, Play, User } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  code: string
  users: any[]
  candidates: any[]
  isAdmin: boolean
  onAddCandidate: (name: string) => void
  onStartVoting: () => void
}

export function LobbyWaiting({ code, users, candidates, isAdmin, onAddCandidate, onStartVoting }: Props) {
  const [newCandName, setNewCandName] = useState('')

  const handleAdd = () => {
    if (!newCandName.trim()) return toast.warning("Scrivi un nome per il candidato!")
    onAddCandidate(newCandName)
    setNewCandName('')
  }

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-900 p-6 rounded-2xl border border-gray-800">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Lobby {code}</h1>
          <div className="flex items-center gap-2 mt-2 text-gray-400">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            {users.length} Persone Online
          </div>
        </div>

        {isAdmin && (
          <button 
            onClick={onStartVoting}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-green-900/20 transition-all active:scale-95"
          >
            <Play size={20} fill="currentColor" /> AVVIA VOTO
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Colonna Sinistra: Partecipanti */}
        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Partecipanti</h3>
          <div className="flex flex-wrap gap-3">
            {users.map((u) => (
              <div key={u.nickname} className="group relative">
                <img 
                  src={u.avatar} 
                  alt={u.nickname} 
                  className="w-12 h-12 rounded-full bg-gray-800 border-2 border-transparent group-hover:border-indigo-500 transition-all"
                />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {u.nickname}
                </span>
              </div>
            ))}
            {users.length === 0 && <div className="text-gray-500 text-sm">In attesa...</div>}
          </div>
        </div>

        {/* Colonna Destra: Candidati */}
        <div className="md:col-span-2 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Candidati</h3>
            <span className="text-xs text-gray-600">{candidates.length} aggiunti</span>
          </div>

          <div className="flex gap-2 mb-6">
            <input 
              value={newCandName}
              onChange={(e) => setNewCandName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Es. Pizza Buitoni..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button 
              onClick={handleAdd}
              disabled={!newCandName}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus />
            </button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {candidates.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-xl text-gray-500">
                Nessun candidato.<br/>Aggiungine uno per iniziare!
              </div>
            ) : (
              candidates.map((c) => (
                <div key={c.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700/50 flex items-center justify-between animate-in slide-in-from-bottom-2 fade-in duration-300">
                  <span className="font-medium text-lg">{c.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}