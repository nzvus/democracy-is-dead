import { Candidate } from '@/entities/candidate/model/types';
import { useTranslations } from 'next-intl';
import { AvatarContainer } from '@/shared/ui/avatar-container';
import { SmartTooltip } from '@/shared/ui/tooltip';

interface SchulzeMatrixProps {
  candidates: Candidate[];
  matrix: number[][]; // d[i][j] - Votes where i > j
}

export const SchulzeMatrix = ({ candidates, matrix }: SchulzeMatrixProps) => {
  const t = useTranslations('Results');

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <p className="text-xs text-gray-500 mb-6 text-center italic">{t('matrix_legend')}</p>
        
        <table className="w-full text-xs md:text-sm border-collapse table-fixed">
          <thead>
            <tr>
              <th className="p-2 w-32 bg-transparent"></th>
              {candidates.map(c => (
                <th key={c.id} className="p-2 w-20 text-center align-bottom">
                  <div className="flex flex-col items-center gap-2">
                    <AvatarContainer src={c.image_url} alt={c.name} seed={c.id} size="sm" className="mx-auto" />
                    {/* [FIX] Added defensive check for c.name */}
                    <span className="truncate w-full block text-[10px] text-gray-400 font-mono">{(c.name || "???").substring(0, 6)}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidates.map((rowCand, i) => (
              <tr key={rowCand.id} className="border-t border-white/5">
                <td className="p-3 flex items-center gap-3 justify-end">
                   <span className="font-bold text-gray-200 text-right truncate w-24">{rowCand.name}</span>
                   <AvatarContainer src={rowCand.image_url} alt={rowCand.name} seed={rowCand.id} size="sm" />
                </td>
                
                {candidates.map((colCand, j) => {
                  if (i === j) return <td key={colCand.id} className="bg-white/5 diagonal-stripe"></td>;
                  
                  const wins = matrix[i][j];
                  const losses = matrix[j][i];
                  const isWinner = wins > losses;
                  const isTie = wins === losses;
                  
                  // Color Logic
                  let bgClass = 'bg-gray-900/50 text-gray-600';
                  if (isWinner) bgClass = 'bg-green-500/20 text-green-400 font-bold shadow-[inset_0_0_10px_rgba(74,222,128,0.1)]';
                  if (!isWinner && !isTie) bgClass = 'bg-red-500/10 text-red-400/50';

                  return (
                    <td key={colCand.id} className={`p-2 text-center border border-white/5 transition-colors hover:bg-white/10 ${bgClass}`}>
                      <SmartTooltip content={`${rowCand.name} beats ${colCand.name} by ${wins} vs ${losses} votes`}>
                        <span className="block w-full h-full cursor-help">
                            {wins}
                        </span>
                      </SmartTooltip>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};