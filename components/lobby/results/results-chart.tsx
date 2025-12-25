'use client'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Factor } from '@/types'

interface ResultsChartProps { results: any[]; factors: Factor[] }
const COLORS = ['#eab308', '#3b82f6', '#ec4899', '#22c55e', '#f97316', '#a855f7']

export default function ResultsChart({ results, factors }: ResultsChartProps) {
  if (!results || results.length === 0) return <div className="text-center p-10 text-gray-500">Dati insufficienti</div>

  const data = factors.map(f => {
      const point: any = { factor: f.name }
      results.forEach(r => {
          const details = r.debugDetails || {}
          point[r.name] = details[f.name] || 0
      })
      return point
  })
  const activeCandidates = results.slice(0, 6)

  return (
    <div className="w-full h-[350px] md:h-[400px] text-xs">
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="factor" tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                {activeCandidates.map((c, i) => (
                    <Radar key={c.id} name={c.name} dataKey={c.name} stroke={COLORS[i % COLORS.length]} strokeWidth={3} fill={COLORS[i % COLORS.length]} fillOpacity={0.2} />
                ))}
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
            </RadarChart>
        </ResponsiveContainer>
    </div>
  )
}