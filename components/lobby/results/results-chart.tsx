'use client'

import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip 
} from 'recharts'
import { Factor } from '@/types'
import { UI } from '@/lib/constants'

interface ResultsChartProps {
  results: any[]
  factors: Factor[]
}

const COLORS = ['#eab308', '#3b82f6', '#ec4899', '#22c55e', '#f97316', '#a855f7']

export default function ResultsChart({ results, factors }: ResultsChartProps) {
  
  if (!results || results.length === 0) return <div className="text-center p-10 text-gray-500">Dati insufficienti per il grafico</div>

  const data = factors.map(f => {
      const point: any = { factor: f.name }
      results.forEach(r => {
          // FIX SICUREZZA: Controlla se debugDetails esiste prima di leggere
          const details = r.debugDetails || {} 
          point[r.name] = details[f.name] || 0
      })
      return point
  })

  const activeCandidates = results.slice(0, 5)

  return (
    <div className={`${UI.COLORS.BG_CARD} border border-gray-800 ${UI.LAYOUT.ROUNDED_LG} p-4 md:p-8 shadow-2xl flex flex-col items-center`}>
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Confronto Fattori</h3>
        
        <div className="w-full h-[300px] md:h-[400px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="factor" tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                    
                    {activeCandidates.map((c, i) => (
                        <Radar
                            key={c.id}
                            name={c.name}
                            dataKey={c.name}
                            stroke={COLORS[i % COLORS.length]}
                            strokeWidth={3}
                            fill={COLORS[i % COLORS.length]}
                            fillOpacity={0.3}
                        />
                    ))}
                    
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    </div>
  )
}