'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { VotingResult } from '@/core/voting/types' 
import { useLanguage } from '@/components/providers/language-provider'

interface ComparisonChartProps {
  weighted: VotingResult
  borda: VotingResult
  schulze: VotingResult
}

export default function ComparisonChart({ weighted, borda, schulze }: ComparisonChartProps) {
  const { t } = useLanguage()

  
  
  const allCandidates = weighted.ranking.map(c => c.name)

  const data = allCandidates.map(name => {
    
    
    const getRank = (res: VotingResult) => {
      const idx = res.ranking.findIndex(c => c.name === name)
      return idx === -1 ? 0 : idx + 1
    }

    return {
      name,
      Weighted: getRank(weighted),
      Borda: getRank(borda),
      Schulze: getRank(schulze),
    }
  })

  return (
    <div className="w-full h-[400px] bg-gray-900/50 rounded-xl p-4 border border-gray-800">
      <h3 className="text-center font-bold text-gray-400 mb-4">{t.results.charts.compare_title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }} 
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9CA3AF" />
          {}
          <YAxis stroke="#9CA3AF" reversed label={{ value: 'Rank (Lower is Better)', angle: -90, position: 'insideLeft', fill: '#6B7280' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#F3F4F6' }}
            cursor={{ fill: '#1F2937' }}
          />
          <Legend />
          <Bar dataKey="Weighted" fill="#8884d8" name={t.results.systems.weighted.title} />
          <Bar dataKey="Borda" fill="#82ca9d" name={t.results.systems.borda.title} />
          <Bar dataKey="Schulze" fill="#ffc658" name={t.results.systems.schulze.title} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}