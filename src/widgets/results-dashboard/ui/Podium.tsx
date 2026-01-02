import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Candidate } from '@/entities/candidate/model/types';
import { Factor } from '@/entities/factor/model/types';
import { calculateSchulze } from '@/shared/lib/voting-math';
import { ChartsContainer } from './ChartsContainer';
import { SchulzeMatrix } from './SchulzeMatrix';
import { RadarAnalysis } from './RadarAnalysis';
import { Podium } from './Podium';
import { Info, Play } from 'lucide-react';
import { SmartTooltip } from '@/shared/ui/tooltip';
import { Button } from '@/shared/ui/button';

interface ResultsDashboardProps {
  candidates: Candidate[];
  votes: any[];
  factors: Factor[];
  onResume?: () => void;
}

export const ResultsDashboard = ({ candidates, votes, factors, onResume }: ResultsDashboardProps) => {
  const t = useTranslations('Results');
  const tDash = useTranslations('Dashboard');
  const [tab, setTab] = useState<'weighted' | 'schulze' | 'radar'>('weighted');

  // --- Calculations ---
  const weightedResults = useMemo(() => {
    return candidates.map(c => {
      const cVotes = votes.filter(v => v.candidate_id === c.id);
      if (cVotes.length === 0) return { candidate: c, score: 0, name: c.name };
      
      // Calculate Weighted Average per candidate (Simplified for view)
      // In production, use the `calculateWeightedScore` from voting-math for full accuracy
      let total = 0;
      let count = 0;
      let maxPossible = 0;

      cVotes.forEach(v => {
        Object.keys(v.scores).forEach(factorId => {
            const val = Number(v.scores[factorId]);
            const factor = factors.find(f => f.id === factorId);
            if (factor && factor.type === 'numerical' && !factor.disabled_candidates?.includes(c.id)) {
                total += val * (factor.weight || 1);
                // Rough normalization for display
                count++; 
            }
        });
      });
      
      const score = count ? (total / count) : 0;
      return { candidate: c, name: c.name, score };
    }).sort((a, b) => b.score - a.score);
  }, [candidates, votes, factors]);

  const schulzeData = useMemo(() => {
    const voterIds = Array.from(new Set(votes.map(v => v.voter_id)));
    const ballots = voterIds.map(vid => {
        const userVotes = votes.filter(v => v.voter_id === vid);
        // Sort candidates by this user's total score to determine rank
        return userVotes
            .sort((a, b) => {
                const sumA = Object.values(a.scores).reduce((x: any, y: any) => x + y, 0) as number;
                const sumB = Object.values(b.scores).reduce((x: any, y: any) => x + y, 0) as number;
                return sumB - sumA;
            })
            .map(v => v.candidate_id);
    });
    // Add candidates who received 0 votes to the end of ballots implicitly
    return calculateSchulze(candidates.map(c => c.id), ballots);
  }, [candidates, votes]);

  return (
    <div className="space-y-8 pb-32">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
         
         {/* Tabs */}
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

         {/* Right Side: Resume Button & Info */}
         <div className="flex items-center gap-3">
            <SmartTooltip content={t(`system_explainer.${tab}`)} side="left">
                <div className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white cursor-help border border-white/5">
                    <Info size={20} />
                </div>
            </SmartTooltip>

            {onResume && (
                <Button 
                    onClick={onResume} 
                    className="btn-primary bg-white text-black hover:bg-gray-200 border-none shadow-xl"
                >
                    <Play size={16} className="mr-2 fill-black" /> {tDash('resume')}
                </Button>
            )}
         </div>
      </div>

      {/* Podium (Weighted Only) */}
      {tab === 'weighted' && <Podium candidates={weightedResults} />}

      {/* Main Content View */}
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