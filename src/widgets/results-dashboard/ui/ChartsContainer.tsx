'use client'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useTranslations } from 'next-intl';

interface ChartData {
  name: string;
  score: number;
}

export const ChartsContainer = ({ data }: { data: ChartData[] }) => {
  const t = useTranslations('Results');

  if (data.length === 0) return (
    <div className="text-center text-gray-500">{t('no_data')}</div>
  );

  return (
    <div className="h-[300px] w-full bg-gray-900/30 rounded-xl p-4 border border-gray-800">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={100} 
            tick={{ fill: '#9CA3AF', fontSize: 12 }} 
            interval={0}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
          />
          <Bar 
            dataKey="score" 
            fill="#6366f1" 
            radius={[0, 4, 4, 0]} 
            barSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};