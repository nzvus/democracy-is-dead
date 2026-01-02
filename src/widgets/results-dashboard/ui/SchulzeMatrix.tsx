import { Candidate } from '@/entities/candidate/model/types';
import { useTranslations } from 'next-intl';
import { SmartEntity } from '@/shared/ui/smart-entity';

interface SchulzeMatrixProps {
  candidates: Candidate[];
  matrix: number[][]; // d[i][j]
}

export const SchulzeMatrix = ({ candidates, matrix }: SchulzeMatrixProps) => {
  const t = useTranslations('Results');

  return (
    <div className="overflow-x-auto bg-gray-900/50 rounded-xl p-4 border border-gray-800">
      <p className="text-xs text-gray-500 mb-4">{t('matrix_legend')}</p>
      
      <table className="w-full text-xs md:text-sm border-collapse">
        <thead>
          <tr>
            <th className="p-2"></th>
            {candidates.map(c => (
              <th key={c.id} className="p-2 min-w-[60px] text-center">
                <SmartEntity label="" seed={c.id} imageUrl={c.image_url} className="justify-center" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {candidates.map((rowCand, i) => (
            <tr key={rowCand.id} className="border-t border-gray-800">
              <td className="p-2 font-bold text-right pr-4">
                 <span className="truncate max-w-[100px] block">{rowCand.name}</span>
              </td>
              {candidates.map((colCand, j) => {
                if (i === j) return <td key={colCand.id} className="bg-gray-800/30"></td>;
                
                const wins = matrix[i][j];
                const losses = matrix[j][i];
                const isWinner = wins > losses;
                
                return (
                  <td 
                    key={colCand.id} 
                    className={`p-2 text-center border-l border-gray-800 ${isWinner ? 'bg-green-500/10 text-green-400 font-bold' : 'text-gray-600'}`}
                  >
                    {wins}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};