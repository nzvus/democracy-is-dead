'use client'
import { useState } from 'react'

export default function InfoButton({ title, desc, history }: { title: string, desc: string, history?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="w-5 h-5 rounded-full bg-gray-800 text-gray-400 border border-gray-600 flex items-center justify-center text-[10px] font-serif italic hover:bg-white hover:text-black transition-colors shrink-0 z-10"
      >
        i
      </button>
      
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setOpen(false)}>
            <div 
                className="w-full max-w-sm bg-gray-900 border border-gray-700 p-6 rounded-2xl shadow-2xl relative animate-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
                
                <h4 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] italic">i</span>
                    {title}
                </h4>
                
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">{desc}</p>
                
                {history && (
                    <div className="bg-black/40 p-4 rounded-xl border border-gray-800">
                        <p className="text-[10px] text-yellow-500 uppercase font-bold mb-2 tracking-widest">Cenni Storici</p>
                        <p className="text-xs text-gray-400 italic leading-relaxed">{history}</p>
                    </div>
                )}
            </div>
        </div>
      )}
    </>
  )
}