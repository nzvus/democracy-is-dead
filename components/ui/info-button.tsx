'use client'
import { useState } from 'react'

export default function InfoButton({ title, desc, history }: { title: string, desc: string, history?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative inline-block ml-2 z-40">
      <button 
        onClick={() => setOpen(!open)}
        className="w-5 h-5 rounded-full bg-gray-800 text-gray-400 border border-gray-600 flex items-center justify-center text-[10px] font-serif italic hover:bg-white hover:text-black transition-colors"
      >
        i
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-2 right-0 w-64 md:w-72 bg-gray-900 border border-gray-700 p-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 animate-in zoom-in-95 duration-200">
             <h4 className="font-bold text-white text-sm mb-2">{title}</h4>
             <p className="text-gray-400 text-xs mb-3 leading-relaxed">{desc}</p>
             {history && (
                 <div className="bg-black/30 p-2 rounded border border-gray-800/50">
                     <p className="text-[10px] text-yellow-500/80 uppercase font-bold mb-1">Cenni Storici</p>
                     <p className="text-[10px] text-gray-500 italic leading-relaxed">{history}</p>
                 </div>
             )}
          </div>
        </>
      )}
    </div>
  )
}