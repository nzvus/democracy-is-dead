'use client'

import { Candidate } from '@/types'
import { useLanguage } from '@/components/providers/language-provider'
import Avatar from '@/components/ui/avatar'
import InfoButton from '@/components/ui/info-button'

interface SchulzeMatrixProps {
  candidates: Candidate[]
  matrix: Record<string, Record<string, number>>
}

export default function SchulzeMatrix({ candidates, matrix }: SchulzeMatrixProps) {
  const { t } = useLanguage()

  return (
    <div className="w-full overflow-hidden bg-gray-900/50 rounded-xl border border-gray-800">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
         <h4 className="font-bold text-sm text-gray-300 flex items-center gap-2">
            {t.results.schulze_matrix.title}
            <InfoButton topicKey="schulze" />
         </h4>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-xs md:text-sm">
          <thead>
            <tr>
              <th className="p-3 bg-gray-900/80 sticky left-0 z-10"></th>
              {candidates.map(c => (
                <th key={c.id} className="p-3 min-w-[60px] text-center font-normal text-gray-500">
                  <div className="flex flex-col items-center gap-1">
                     <Avatar seed={c.name} className="w-6 h-6 opacity-70" />
                     <span className="truncate max-w-[60px]">{c.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidates.map(rowC => (
              <tr key={rowC.id} className="border-t border-gray-800 hover:bg-white/5 transition-colors">
                <td className="p-3 bg-gray-900/80 sticky left-0 z-10 font-bold text-gray-300 flex items-center gap-2 min-w-[120px]">
                    <Avatar seed={rowC.name} className="w-6 h-6" />
                    {rowC.name}
                </td>
                {candidates.map(colC => {
                    if (rowC.id === colC.id) {
                        return <td key={colC.id} className="bg-gray-800/50"></td>
                    }
                    
                    const wins = matrix[rowC.id]?.[colC.id] || 0
                    const losses = matrix[colC.id]?.[rowC.id] || 0
                    const isWinner = wins > losses
                    const isTie = wins === losses

                    return (
                        <td key={colC.id} className={`p-3 text-center border-l border-gray-800/50 ${isWinner ? 'text-green-400 font-bold bg-green-900/10' : isTie ? 'text-gray-500' : 'text-red-900/50'}`}>
                            {wins}
                        </td>
                    )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-2 bg-gray-950 text-[10px] text-gray-500 text-center font-mono">
         {t.results.schulze_matrix.subtitle}
      </div>
    </div>
  )
}