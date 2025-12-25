'use client'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Candidate } from '@/types'

interface CandidateTooltipProps {
  candidate: Candidate
  children: React.ReactNode
  className?: string
}

export default function CandidateTooltip({ candidate, children, className = '' }: CandidateTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      // Calcoliamo la posizione: centrato orizzontalmente rispetto all'elemento, sopra di esso
      setCoords({
        top: rect.top - 10, // 10px sopra l'elemento
        left: rect.left + rect.width / 2
      })
      setIsOpen(true)
    }
  }

  return (
    <>
      <div 
        ref={triggerRef}
        className={`relative inline-block ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)} // Supporto Mobile
      >
        {children}
      </div>

      {/* Usiamo Portal per renderizzare il tooltip direttamente nel body, sopra a tutto */}
      {isOpen && (
        <Portal>
          <div 
            className="fixed z-[9999] w-64 pointer-events-none transition-opacity duration-200 animate-in fade-in zoom-in-95"
            style={{ 
              top: coords.top, 
              left: coords.left, 
              transform: 'translate(-50%, -100%)' // Sposta il tooltip sopra e centrato
            }}
          >
             <div className="bg-gray-950/95 backdrop-blur-xl border border-gray-700 p-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative">
                {/* Freccina in basso */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-950 border-r border-b border-gray-700 rotate-45"></div>

                <div className="text-center relative z-10">
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
        </Portal>
      )}
    </>
  )
}

// Helper per renderizzare nel body
const Portal = ({ children }: { children: React.ReactNode }) => {
  if (typeof window === 'undefined') return null
  return createPortal(children, document.body)
}