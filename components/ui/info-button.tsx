'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import EncyclopediaModal from './encyclopedia-modal'

interface InfoButtonProps {
  topicKey?: string 
  simpleText?: string 
  size?: number
  className?: string
}

export default function InfoButton({ topicKey, simpleText, size = 16, className = "" }: InfoButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  
  if (!topicKey && simpleText) {
      return (
          <div className={`group relative inline-flex items-center justify-center cursor-help ${className}`} title={simpleText}>
              <Info size={size} className="text-gray-500 hover:text-white transition-colors" />
          </div>
      )
  }

  
  return (
    <>
        <button 
            type="button"
            onClick={() => setIsOpen(true)}
            className={`inline-flex items-center justify-center text-gray-500 hover:text-indigo-400 transition-colors ${className}`}
        >
            <Info size={size} />
        </button>

        {topicKey && (
            <EncyclopediaModal 
                topicKey={topicKey} 
                isOpen={isOpen} 
                onClose={() => setIsOpen(false)}  
            />
        )}
    </>
  )
}