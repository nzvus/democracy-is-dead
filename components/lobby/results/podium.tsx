'use client'
import { Candidate } from '@/types'

export default function Podium({ top3 }: { top3: Candidate[] }) {
  if (top3.length === 0) return null
  const winner = top3[0]
  const second = top3[1]
  const third = top3[2]

  return (
    <div className="flex justify-center items-end gap-2 md:gap-4 h-64 md:h-80 w-full max-w-lg mx-auto mb-8">
        
        {}
        {second && (
            <div className="flex flex-col items-center w-1/3 animate-in slide-in-from-bottom-10 duration-700 delay-100">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-gray-300 overflow-hidden mb-2 shadow-lg bg-gray-800">
                    {second.image_url ? <img src={second.image_url} className="w-full h-full object-cover"/> : <div className="text-2xl flex items-center justify-center h-full">🥈</div>}
                </div>
                <div className="w-full bg-gradient-to-t from-gray-900 to-gray-700 rounded-t-lg h-32 md:h-40 flex flex-col justify-end p-2 text-center border-t-4 border-gray-400 relative">
                    <span className="text-4xl font-black text-white/10 absolute top-2 left-1/2 -translate-x-1/2">2</span>
                    <p className="text-xs md:text-sm font-bold text-gray-200 truncate">{second.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{(second as any).finalScore.toFixed(1)}</p>
                </div>
            </div>
        )}

        {}
        <div className="flex flex-col items-center w-1/3 z-10 animate-in slide-in-from-bottom-10 duration-700">
             <div className="text-4xl mb-2 animate-bounce">👑</div>
             <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-yellow-400 overflow-hidden mb-2 shadow-[0_0_30px_rgba(250,204,21,0.4)] bg-gray-800">
                {winner.image_url ? <img src={winner.image_url} className="w-full h-full object-cover"/> : <div className="text-4xl flex items-center justify-center h-full">🏆</div>}
             </div>
             <div className="w-full bg-gradient-to-t from-yellow-900/80 to-yellow-600 rounded-t-lg h-48 md:h-56 flex flex-col justify-end p-3 text-center border-t-4 border-yellow-400 relative shadow-2xl">
                <span className="text-6xl font-black text-white/20 absolute top-4 left-1/2 -translate-x-1/2">1</span>
                <p className="text-sm md:text-lg font-black text-white truncate">{winner.name}</p>
                <p className="text-xs text-yellow-200 font-mono font-bold">{(winner as any).finalScore.toFixed(1)} pts</p>
             </div>
        </div>

        {}
        {third && (
            <div className="flex flex-col items-center w-1/3 animate-in slide-in-from-bottom-10 duration-700 delay-200">
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-orange-700 overflow-hidden mb-2 shadow-lg bg-gray-800">
                    {third.image_url ? <img src={third.image_url} className="w-full h-full object-cover"/> : <div className="text-2xl flex items-center justify-center h-full">🥉</div>}
                </div>
                <div className="w-full bg-gradient-to-t from-orange-950 to-orange-800 rounded-t-lg h-24 md:h-32 flex flex-col justify-end p-2 text-center border-t-4 border-orange-600 relative">
                    <span className="text-4xl font-black text-white/10 absolute top-2 left-1/2 -translate-x-1/2">3</span>
                    <p className="text-xs md:text-sm font-bold text-orange-100 truncate">{third.name}</p>
                    <p className="text-[10px] text-orange-300 font-mono">{(third as any).finalScore.toFixed(1)}</p>
                </div>
            </div>
        )}
    </div>
  )
}