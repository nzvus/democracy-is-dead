'use client'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
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

  // Transform data: One object per Factor, keys are candidate IDs
  const activeFactors = factors.filter(f => f.type === 'numerical' && !f.is_hidden);
  
  const data = activeFactors.map(factor => {
      const point: any = { factor: factor.name, fullMark: 10 }; 
      
      candidates.forEach(c => {
        // Skip null factors
        if (factor.disabled_candidates?.includes(c.id)) {
            point[c.id] = 0; 
            return;
        }

        const cVotes = votes.filter(v => v.candidate_id === c.id);
        const total = cVotes.reduce((sum, v) => sum + (v.scores[factor.id] || 0), 0);
        point[c.id] = cVotes.length ? (total / cVotes.length) : 0;
      });
      return point;
    });

  const colors = ['#818cf8', '#34d399', '#fbbf24', '#f472b6', '#60a5fa'];

  if (activeFactors.length < 3) {
      // [FIX] Used translation key
      return <div className="text-center text-gray-500 py-20 italic">{t('need_more_factors')}</div>;
  }

  return (
    <div className="h-[500px] w-full">
      <h3 className="text-center text-gray-400 text-sm mb-2">{t('radar_legend')}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#374151" strokeDasharray="3 3" />
          <PolarAngleAxis dataKey="factor" tick={{ fill: '#e5e7eb', fontSize: 11, fontWeight: 'bold' }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
          
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#374151', borderRadius: '12px', color: '#fff' }}
            itemStyle={{ fontSize: '12px' }}
          />

          {candidates.map((c, i) => (
            <Radar
              key={c.id}
              name={c.name}
              dataKey={c.id}
              stroke={colors[i % colors.length]}
              strokeWidth={3}
              fill={colors[i % colors.length]}
              fillOpacity={0.2}
            />
          ))}
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};