import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Candidate } from '@/entities/candidate/model/types';
import { Factor } from '@/entities/factor/model/types';
import { calculateSchulze } from '@/shared/lib/voting-math';
import { ChartsContainer } from './ChartsContainer';
import { SchulzeMatrix } from './SchulzeMatrix';
import { RadarAnalysis } from './RadarAnalysis';
import { Podium } from './Podium';
import { Info } from 'lucide-react';
import { SmartTooltip } from '@/shared/ui/tooltip';

interface ResultsDashboardProps {
  candidates: Candidate[];
  votes: any[];
  factors: Factor[];
}

export const ResultsDashboard = ({ candidates, votes, factors }: ResultsDashboardProps) => {
  const t = useTranslations('Results');
  const [tab, setTab] = useState<'weighted' | 'schulze' | 'radar'>('weighted');

  // --- Calculations ---
  const weightedResults = useMemo(() => {
    return candidates.map(c => {
      const cVotes = votes.filter(v => v.candidate_id === c.id);
      if (cVotes.length === 0) return { candidate: c, score: 0, name: c.name }; // Return struct for Podium
      
      let total = 0;
      let count = 0;
      cVotes.forEach(v => {
        Object.values(v.scores).forEach((val: any) => {
          total += Number(val);
          count++;
        });
      });
      return { candidate: c, name: c.name, score: count ? (total / count) : 0 };
    }).sort((a, b) => b.score - a.score);
  }, [candidates, votes]);

  const schulzeData = useMemo(() => {
    const voterIds = Array.from(new Set(votes.map(v => v.voter_id)));
    const ballots = voterIds.map(vid => {
        const userVotes = votes.filter(v => v.voter_id === vid);
        return userVotes
            .sort((a, b) => {
                const sumA = Object.values(a.scores).reduce((x: any, y: any) => x + y, 0) as number;
                const sumB = Object.values(b.scores).reduce((x: any, y: any) => x + y, 0) as number;
                return sumB - sumA;
            })
            .map(v => v.candidate_id);
    });
    return calculateSchulze(candidates.map(c => c.id), ballots);
  }, [candidates, votes]);

  return (
    <div className="space-y-8 pb-32">
      
      {/* Podium (Only for weighted currently for simplicity, or switch based on tab) */}
      {tab === 'weighted' && <Podium candidates={weightedResults} />}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2 p-1 bg-gray-900/80 border border-white/10 rounded-xl backdrop-blur-md">
            {(['weighted', 'schulze', 'radar'] as const).map(key => (
            <button 
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === key ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
                {t(`tabs.${key}`)}
            </button>
            ))}
        </div>
        
        <SmartTooltip content={t(`system_explainer.${tab}`)} side="left">
            <div className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white cursor-help">
                <Info size={20} />
            </div>
        </SmartTooltip>
      </div>

      {/* Views */}
      <div className="glass-card p-6 min-h-[400px]">
        {tab === 'weighted' && <ChartsContainer data={weightedResults} />}
        
        {tab === 'schulze' && (
            <SchulzeMatrix 
                candidates={candidates} 
                matrix={schulzeData.matrix} 
            />
        )}

        {tab === 'radar' && (
            <RadarAnalysis 
                candidates={candidates} 
                factors={factors} 
                votes={votes} 
            />
        )}
      </div>
    </div>
  );
};