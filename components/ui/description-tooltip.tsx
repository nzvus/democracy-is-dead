'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'

interface DescriptionTooltipProps {
  title: string
  description?: string // Opzionale perché in alcuni file potrebbe essere undefined
  children?: React.ReactNode // I figli fungono da trigger
}

export default function DescriptionTooltip({ title, description, children }: DescriptionTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Se non c'è descrizione, mostriamo solo i figli senza tooltip
  if (!description) {
      return <>{children}</>
  }

  return (
    <div className="relative inline-flex items-center group">
      <div 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help flex items-center"
      >
        {/* Se non vengono passati figli, usiamo l'icona di default */}
        {children ? children : <Info size={14} className="text-gray-500 hover:text-indigo-400" />}
      </div>

      {/* Tooltip */}
      <div className={`
        absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 
        bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50
        transition-all duration-200 pointer-events-none
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}>
        <h5 className="font-bold text-xs text-white mb-1">{title}</h5>
        <p className="text-[10px] text-gray-400 leading-tight">{description}</p>
        
        {/* Freccetta */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  )
}