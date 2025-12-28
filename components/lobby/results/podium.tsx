'use client'

import { Candidate } from '@/types'
import Avatar from '@/components/ui/avatar'
import { motion } from 'framer-motion'

export default function Podium({ top3 }: { top3: Candidate[] }) {
  if (top3.length === 0) return null

  const winner = top3[0]
  const second = top3[1]
  const third = top3[2]

  return (
    <div className="flex justify-center items-end gap-2 md:gap-4 h-64 md:h-80 w-full max-w-lg mx-auto mb-8 px-4">
      
      {second && (
        <motion.div 
            initial={{ height: 0, opacity: 0 }} animate={{ height: '60%', opacity: 1 }} transition={{ delay: 0.2 }}
            className="w-1/3 bg-gradient-to-t from-gray-800 to-gray-700 rounded-t-xl relative flex flex-col items-center justify-end pb-4 border-t-4 border-gray-400"
        >
            <div className="absolute -top-12 md:-top-16 flex flex-col items-center">
                <Avatar seed={second.name} src={second.image_url} className="w-12 h-12 md:w-16 md:h-16 border-4 border-gray-400 shadow-xl" />
                <span className="font-bold text-xs md:text-sm mt-2 text-gray-300 text-center line-clamp-2 max-w-[80px]">{second.name}</span>
            </div>
            <span className="text-4xl font-black text-gray-500/20">2</span>
        </motion.div>
      )}

      <motion.div 
          initial={{ height: 0, opacity: 0 }} animate={{ height: '80%', opacity: 1 }}
          className="w-1/3 bg-gradient-to-t from-yellow-900/50 to-yellow-600 rounded-t-xl relative flex flex-col items-center justify-end pb-4 border-t-4 border-yellow-400 z-10 shadow-[0_0_50px_-10px_rgba(250,204,21,0.3)]"
      >
          <div className="absolute -top-16 md:-top-20 flex flex-col items-center">
             <div className="relative">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl animate-bounce">👑</span>
                <Avatar seed={winner.name} src={winner.image_url} className="w-16 h-16 md:w-20 md:h-20 border-4 border-yellow-400 shadow-2xl" />
             </div>
             <span className="font-bold text-sm md:text-base mt-2 text-yellow-400 text-center line-clamp-2 max-w-[100px]">{winner.name}</span>
          </div>
          <span className="text-5xl font-black text-yellow-900/30">1</span>
      </motion.div>

      {third && (
        <motion.div 
            initial={{ height: 0, opacity: 0 }} animate={{ height: '40%', opacity: 1 }} transition={{ delay: 0.4 }}
            className="w-1/3 bg-gradient-to-t from-orange-900/50 to-orange-800 rounded-t-xl relative flex flex-col items-center justify-end pb-4 border-t-4 border-orange-600"
        >
             <div className="absolute -top-12 md:-top-16 flex flex-col items-center">
                <Avatar seed={third.name} src={third.image_url} className="w-12 h-12 md:w-16 md:h-16 border-4 border-orange-600 shadow-xl" />
                <span className="font-bold text-xs md:text-sm mt-2 text-orange-300 text-center line-clamp-2 max-w-[80px]">{third.name}</span>
            </div>
            <span className="text-4xl font-black text-orange-900/20">3</span>
        </motion.div>
      )} 
    </div>
  )
}