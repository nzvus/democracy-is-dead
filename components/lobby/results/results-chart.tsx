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

// Colori brillanti per i candidati (ciclici)
const COLORS = ['#eab308', '#3b82f6', '#ec4899', '#22c55e', '#f97316', '#a855f7']

export default function ResultsChart({ results, factors }: ResultsChartProps) {
  
  // Trasformiamo i dati per il grafico Radar
  // Formato necessario: [ { factor: "Gusto", Pizza: 8, Sushi: 9 }, { factor: "Prezzo", Pizza: 10, Sushi: 4 } ]
  const data = factors.map(f => {
      const point: any = { factor: f.name }
      results.forEach(r => {
          // Usiamo il valore normalizzato (0-10) che l'engine ha già calcolato in 'debugDetails'
          // Se non c'è, usiamo 0
          point[r.name] = r.debugDetails[f.name] || 0
      })
      return point
  })

  // Prendiamo solo i primi 3-4 candidati per non fare un pasticcio grafico, 
  // oppure tutti se sono pochi.
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
                            fillOpacity={0.3} // Trasparenza per vedere le sovrapposizioni
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