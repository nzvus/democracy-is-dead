'use client'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { Candidate } from '@/entities/candidate/model/types';
import { Factor } from '@/entities/factor/model/types';
import { useTranslations } from 'next-intl';

interface RadarAnalysisProps {
  candidates: Candidate[];
  factors: Factor[];
  votes: any[];
}

export const RadarAnalysis = ({ candidates, factors, votes }: RadarAnalysisProps) => {
  const t = useTranslations('Results');

  // Transform data: One object per Factor, with keys for each candidate
  const data = factors
    .filter(f => f.type === 'numerical')
    .map(factor => {
      const point: any = { factor: factor.name, fullMark: 10 }; // Assuming scale 10 for simplicity
      
      candidates.forEach(c => {
        const cVotes = votes.filter(v => v.candidate_id === c.id);
        const total = cVotes.reduce((sum, v) => sum + (v.scores[factor.id] || 0), 0);
        point[c.id] = cVotes.length ? (total / cVotes.length) : 0;
      });
      
      return point;
    });

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  return (
    <div className="h-[400px] w-full bg-gray-900/30 rounded-xl p-4 border border-gray-800">
      <h3 className="text-center text-gray-400 text-sm mb-4">{t('radar_legend')}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="factor" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
          
          {candidates.map((c, i) => (
            <Radar
              key={c.id}
              name={c.name}
              dataKey={c.id}
              stroke={colors[i % colors.length]}
              fill={colors[i % colors.length]}
              fillOpacity={0.3}
            />
          ))}
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};