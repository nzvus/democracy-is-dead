'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Candidate } from '@/types'

export default function ComparisonChart({ allResults, candidates }: { allResults: any, candidates: Candidate[] }) {
  if (!allResults) return null;
  const data = candidates.map(c => {
      // Find Rank (index + 1)
      const rankW = allResults.weighted?.findIndex((r: any) => r.id === c.id) + 1 || 0
      const rankB = allResults.borda?.findIndex((r: any) => r.id === c.id) + 1 || 0
      const rankM = allResults.median?.findIndex((r: any) => r.id === c.id) + 1 || 0
      return { name: c.name, Weighted: rankW, Borda: rankB, Median: rankM }
  })

  return (
    <div className="w-full h-[350px]">
        <h4 className="text-center text-xs text-gray-500 mb-4 font-mono uppercase">Classifica (Barra più corta = Migliore)</h4>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" domain={[0, 'dataMax']} tick={{ fill: '#9ca3af' }} hide />
                <YAxis dataKey="name" type="category" tick={{ fill: '#e5e7eb', fontSize: 12, fontWeight: 'bold' }} width={80} />
                <Tooltip cursor={{fill: '#1f2937'}} contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
                <Legend />
                <Bar dataKey="Weighted" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={8} name="Media" />
                <Bar dataKey="Borda" fill="#eab308" radius={[0, 4, 4, 0]} barSize={8} name="Borda" />
                <Bar dataKey="Median" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={8} name="Mediana" />
            </BarChart>
        </ResponsiveContainer>
    </div>
  )
}