'use client'
import { useState } from 'react'
import { useLanguage } from '@/components/providers/language-provider'

export default function InfoButton({ title, desc, history }: { title: string, desc: string, history?: string }) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div 
      className="relative inline-flex items-center ml-2 z-40"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={() => setIsOpen(!isOpen)} 
    >
      <button 
        className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-serif italic transition-all cursor-help ${isOpen ? 'bg-white text-black border-white' : 'bg-gray-800 text-gray-400 border-gray-600 hover:bg-gray-700'}`}
      >
        i
      </button>
      
      {}
      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 md:w-72 bg-gray-900/95 backdrop-blur-xl border border-gray-700 p-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-200 pointer-events-none ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95 pointer-events-none'}`}>
         
         {}
         <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 border-r border-b border-gray-700 rotate-45"></div>

         <h4 className="font-bold text-white text-sm mb-2 relative z-10">{title}</h4>
         <p className="text-gray-300 text-xs mb-3 leading-relaxed relative z-10">{desc}</p>
         
         {history && (
             <div className="bg-black/40 p-2 rounded border border-gray-800/50 relative z-10">
                 <p className="text-[9px] text-yellow-500 uppercase font-bold mb-1 tracking-widest">{t.common.history}</p>
                 <p className="text-[10px] text-gray-400 italic leading-relaxed">{history}</p>
             </div>
         )}
      </div>
    </div>
  )
}