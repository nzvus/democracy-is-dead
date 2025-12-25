'use client'
import { useState } from 'react'
import { Candidate } from '@/types'

interface CandidateTooltipProps {
  candidate: Candidate
  children: React.ReactNode
  className?: string
}

export default function CandidateTooltip({ candidate, children, className = '' }: CandidateTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div 
      className={`relative group ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={() => setIsOpen(!isOpen)} // Mobile support
    >
      {children}

      {/* Tooltip Popup */}
      {/* Usiamo z-50 e fixed/absolute strategy per cercare di uscire dai container overflow */}
      <div 
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-60 bg-gray-950/95 backdrop-blur-md border border-gray-700 p-4 rounded-xl shadow-2xl z-[100] transition-all duration-200 pointer-events-none ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}`}
      >
         {/* Freccina */}
         <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-950 border-r border-b border-gray-700 rotate-45"></div>

         <div className="relative z-10 text-center">
            <h4 className="font-bold text-white text-sm mb-1">{candidate.name}</h4>
            <div className="h-0.5 w-8 bg-indigo-500 mx-auto mb-2 rounded-full"></div>
            
            {candidate.description ? (
                <p className="text-gray-300 text-xs leading-relaxed line-clamp-6">
                    {candidate.description}
                </p>
            ) : (
                <p className="text-gray-500 text-[10px] italic">Nessuna descrizione.</p>
            )}
         </div>
      </div>
    </div>
  )
}