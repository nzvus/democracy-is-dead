import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Candidate } from '@/entities/candidate/model/types';
import { Factor } from '@/entities/factor/model/types';
import { calculateSchulze } from '@/shared/lib/voting-math';
import { ChartsContainer } from './ChartsContainer';
import { SchulzeMatrix } from './SchulzeMatrix';
import { RadarAnalysis } from './RadarAnalysis';

interface ResultsDashboardProps {
  candidates: Candidate[];
  votes: any[];
  factors: Factor[];
}

export const ResultsDashboard = ({ candidates, votes, factors }: ResultsDashboardProps) => {
  const t = useTranslations('Results');
  const [tab, setTab] = useState<'weighted' | 'schulze' | 'radar'>('weighted');

  // --- Calc Logic ---
  const weightedResults = useMemo(() => {
    return candidates.map(c => {
      const cVotes = votes.filter(v => v.candidate_id === c.id);
      if (cVotes.length === 0) return { name: c.name, score: 0 };
      
      let total = 0;
      let count = 0;
      cVotes.forEach(v => {
        Object.values(v.scores).forEach((val: any) => {
          total += Number(val);
          count++;
        });
      });
      return { name: c.name, score: count ? (total / count) : 0 };
    }).sort((a, b) => b.score - a.score);
  }, [candidates, votes]);

  const schulzeData = useMemo(() => {
    // Generate ballots for Schulze lib
    // (Simplified: assuming voters ranked candidates based on raw score sum)
    const voterIds = Array.from(new Set(votes.map(v => v.voter_id)));
    const ballots = voterIds.map(vid => {
        const userVotes = votes.filter(v => v.voter_id === vid);
        // Sort candidates by this user's total score
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
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-gray-900 rounded-lg w-fit">
        {(['weighted', 'schulze', 'radar'] as const).map(key => (
          <button 
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${tab === key ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            {t(`tabs.${key}`)}
          </button>
        ))}
      </div>

      {/* Views */}
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
  );
};