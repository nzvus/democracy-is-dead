'use client'
import { Factor } from '@/types'
import { UI } from '@/lib/constants'
import { useLanguage } from '@/components/providers/language-provider'
import { getScoreColor } from '@/lib/lobby-utils'

interface RankingTableProps { results: any[], factors: Factor[] }

export default function RankingTable({ results, factors }: RankingTableProps) {
  const { t } = useLanguage()

  return (
    <div className={`${UI.COLORS.BG_CARD} overflow-hidden shadow-2xl md:rounded-lg border-y md:border border-gray-800`}>
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[350px]">
                <thead className="bg-gray-950 text-[10px] uppercase text-gray-400 font-mono tracking-wider">
                    <tr>
                        <th className="p-2 md:p-4 w-8 md:w-10 text-center">#</th>
                        <th className="p-2 md:p-4 min-w-[120px]">{t.results.col_cand}</th>
                        <th className="p-2 md:p-4 text-right text-yellow-500 font-bold border-l border-gray-800">SCORE</th>
                        {factors.map(f => (
                            <th key={f.id} className="p-2 md:p-4 text-center border-l border-gray-800 min-w-[70px]">
                                <div className="flex flex-col items-center">
                                    <span className="hidden md:inline">{f.name}</span>
                                    <span className="md:hidden">{f.name.substring(0, 3)}</span>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-xs md:text-sm">
                    {results.map((r, i) => {
                        const isWin = i === 0;
                        return (
                            <tr key={r.id} className={`group hover:bg-gray-800/30 transition-colors ${isWin ? 'bg-yellow-900/10' : ''}`}>
                                <td className="p-2 md:p-4 text-center font-mono text-gray-500 font-bold">{i + 1}</td>
                                <td className="p-2 md:p-4">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gray-800 overflow-hidden shrink-0 border border-gray-700">
                                            {r.image_url && <img src={r.image_url} className="w-full h-full object-cover"/>}
                                        </div>
                                        <div className="font-bold leading-tight flex items-center gap-1">
                                            <span className="truncate max-w-[100px] md:max-w-none">{r.name}</span>
                                            {isWin && <span>🥇</span>}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-2 md:p-4 text-right font-black text-sm md:text-xl font-mono text-yellow-400 border-l border-gray-800 bg-gray-900/30">
                                    {r.finalScore.toFixed(1)}
                                </td>
                                {factors.map(f => {
                                    const normalizedScore = r.debugDetails?.[f.name] || 0
                                    const barColor = getScoreColor(normalizedScore, 10, false)
                                    let displayValue: string | number = "-"
                                    if (f.type === 'static') displayValue = r.static_values?.[f.id] ?? "-"
                                    else displayValue = normalizedScore.toFixed(1)

                                    return (
                                        <td key={f.id} className="p-2 md:p-4 text-center border-l border-gray-800 relative">
                                            <div className={`absolute bottom-0 left-0 h-1 transition-all ${barColor}`} style={{ width: `${Math.min(normalizedScore * 10, 100)}%`, opacity: 0.6 }} />
                                            <span className={`font-mono font-bold relative z-10 ${normalizedScore > 5 ? 'text-white' : 'text-gray-500'}`}>
                                                {displayValue}
                                            </span>
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    </div>
  )
}