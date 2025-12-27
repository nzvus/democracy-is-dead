'use client'

import { Candidate } from '@/types'
import { useLanguage } from '@/components/providers/language-provider'
import { Star } from 'lucide-react'
import InfoButton from '@/components/ui/info-button'
import Avatar from '@/components/ui/avatar'
import { UI } from '@/lib/constants'

interface JollySelectorProps {
  candidates: Candidate[]
  selectedId: string | null
  onSelect: (id: string) => void
  disabled?: boolean
}

export default function JollySelector({ candidates, selectedId, onSelect, disabled }: JollySelectorProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
      <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-yellow-500 flex items-center gap-2">
                {t.lobby.voting.jolly_section.title}
                <InfoButton topicKey="jolly" className="text-yellow-500/70 hover:text-yellow-400" />
            </h3>
            <p className="text-gray-400 text-xs">{t.lobby.voting.jolly_section.subtitle}</p>
          </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {candidates.map(candidate => {
            const isSelected = selectedId === candidate.id
            return (
                <button
                    key={candidate.id}
                    onClick={() => onSelect(candidate.id)}
                    disabled={disabled}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-3 group
                        ${isSelected 
                            ? `border-yellow-500 bg-yellow-500/10 shadow-[0_0_30px_-5px_rgba(234,179,8,0.3)] scale-105` 
                            : 'border-gray-800 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-800'
                        }
                    `}
                >
                    {/* Icona Stella */}
                    <div className={`absolute top-2 right-2 transition-all ${isSelected ? 'opacity-100 text-yellow-500 rotate-12 scale-125' : 'opacity-20 text-gray-500'}`}>
                        <Star fill={isSelected ? "currentColor" : "none"} size={20} />
                    </div>

                    <Avatar seed={candidate.name} className="w-12 h-12" />
                    
                    <span className={`text-sm font-bold text-center leading-tight ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {candidate.name}
                    </span>
                </button>
            )
        })}
      </div>
    </div>
  )
}