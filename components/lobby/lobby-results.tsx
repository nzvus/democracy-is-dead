'use client'

import { Trophy, RefreshCcw } from 'lucide-react'

interface Props {
  results: { name: string; score: number }[]
}

export function LobbyResults({ results }: Props) {
  return (
    <div className="flex flex-col items-center max-w-lg mx-auto w-full animate-in slide-in-from-bottom-10 duration-700">
      <div className="bg-yellow-500/10 p-8 rounded-full mb-8 ring-4 ring-yellow-500/20">
        <Trophy size={64} className="text-yellow-400 drop-shadow-lg" />
      </div>
      
      <h1 className="text-4xl font-black mb-10 text-center bg-gradient-to-r from-yellow-200 to-yellow-600 bg-clip-text text-transparent">
        Risultati Finali
      </h1>

      <div className="w-full space-y-4">
        {results.map((r, index) => {
          const isWinner = index === 0
          return (
            <div 
              key={r.name} 
              className={`
                relative p-5 rounded-xl flex justify-between items-center transition-all
                ${isWinner 
                  ? 'bg-gradient-to-r from-yellow-900/50 to-gray-900 border border-yellow-500/50 shadow-yellow-900/20 shadow-xl scale-105 z-10' 
                  : 'bg-gray-900 border border-gray-800'
                }
              `}
            >
              {isWinner && (
                <div className="absolute -top-3 -left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded shadow-lg transform -rotate-6">
                  VINCITORE
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <span className={`font-mono text-xl font-bold ${isWinner ? 'text-yellow-500' : 'text-gray-600'}`}>
                  #{index + 1}
                </span>
                <span className={`font-bold text-lg ${isWinner ? 'text-white' : 'text-gray-300'}`}>
                  {r.name}
                </span>
              </div>
              
              <span className="font-mono text-xl font-bold text-gray-400">
                {r.score} <span className="text-xs">pt</span>
              </span>
            </div>
          )
        })}
      </div>

      <button 
        onClick={() => window.location.href = '/'}
        className="mt-12 flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
      >
        <RefreshCcw size={16} />
        Torna alla Home
      </button>
    </div>
  )
}