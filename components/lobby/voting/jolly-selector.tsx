'use client'

import { Candidate } from '@/types'
import Avatar from '@/components/ui/avatar'

interface JollySelectorProps {
    candidates: Candidate[]
    selectedId: string | null
    onSelect: (id: string) => void
}

export default function JollySelector({ candidates, selectedId, onSelect }: JollySelectorProps) {
  if (candidates.length === 0) return null

  return (
    <div className="space-y-4">
        <div className="bg-gradient-to-r from-yellow-900/20 to-transparent p-4 rounded-xl border border-yellow-500/20">
            <h3 className="font-bold text-yellow-500 flex items-center gap-2">
                Assegna il tuo Jolly 🃏
            </h3>
            <p className="text-xs text-yellow-200/60 mt-1">
                Hai un solo bonus speciale. Scegli il tuo campione indiscusso.
            </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {candidates.map(c => {
                const isSelected = selectedId === c.id
                return (
                    <button
                        key={c.id}
                        onClick={() => onSelect(c.id)}
                        className={`relative p-3 rounded-xl border transition-all duration-200 flex flex-col items-center gap-2 group
                            ${isSelected 
                                ? 'bg-yellow-500/10 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                                : 'bg-gray-900 border-gray-800 hover:border-gray-600 hover:bg-gray-800'
                            }
                        `}
                    >
                        {isSelected && <div className="absolute top-2 right-2 text-yellow-500 animate-bounce">★</div>}
                        <Avatar seed={c.name} src={c.image_url} className={`w-12 h-12 ${isSelected ? 'ring-2 ring-yellow-500' : 'opacity-70 group-hover:opacity-100'}`} />
                        <span className={`text-xs font-bold truncate w-full text-center ${isSelected ? 'text-yellow-400' : 'text-gray-400'}`}>
                            {c.name}
                        </span>
                    </button>
                )
            })}
        </div>
    </div>
  )
}