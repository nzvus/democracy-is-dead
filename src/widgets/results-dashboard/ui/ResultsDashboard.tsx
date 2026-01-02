import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Candidate } from '@/entities/candidate/model/types';
import { Factor } from '@/entities/factor/model/types';
import { calculateSchulze } from '@/shared/lib/voting-math';
import { ChartsContainer } from './ChartsContainer';
import { SchulzeMatrix } from './SchulzeMatrix';
import { RadarAnalysis } from './RadarAnalysis';
import { VoterAnalysis } from './VoterAnalysis'; // [NEW]
import { Podium } from './Podium';
import { Info, Play, Users } from 'lucide-react';
import { SmartTooltip } from '@/shared/ui/tooltip';
import { Button } from '@/shared/ui/button';
import { createClient } from '@/shared/api/supabase'; // To get participants? Or pass them in props

interface ResultsDashboardProps {
  candidates: Candidate[];
  votes: any[];
  factors: Factor[];
  onResume?: () => void;
}

export const ResultsDashboard = ({ candidates, votes, factors, onResume }: ResultsDashboardProps) => {
  const t = useTranslations('Results');
  const tDash = useTranslations('Dashboard');
  // [NEW] Added 'badges' tab
  const [tab, setTab] = useState<'weighted' | 'schulze' | 'radar' | 'badges'>('weighted');
  
  // Need participants for Badge view. Ideally passed as prop, fetching here for MVP fix.
  const [participants, setParticipants] = useState<any[]>([]);
  
  useMemo(async () => {
    const supabase = createClient();
    // In production, pass this down from LobbyPage
    const { data } = await supabase.from('lobby_participants').select('*').eq('lobby_id', candidates[0]?.lobby_id);
    if(data) setParticipants(data);
  }, [candidates]);

  // --- Calculations ---
  const weightedResults = useMemo(() => {
    return candidates.map(c => {
      const cVotes = votes.filter(v => v.candidate_id === c.id);
      if (cVotes.length === 0) return { candidate: c, score: 0, name: c.name };
      
      let total = 0;
      let count = 0;
      cVotes.forEach(v => {
        Object.keys(v.scores).forEach(factorId => {
            const val = Number(v.scores[factorId]);
            const factor = factors.find(f => f.id === factorId);
            if (factor && factor.type === 'numerical' && !factor.disabled_candidates?.includes(c.id)) {
                total += val * (factor.weight || 1);
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
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
         <div className="flex flex-wrap gap-2 p-1 bg-gray-900/80 border border-white/10 rounded-xl backdrop-blur-md">
            {(['weighted', 'schulze', 'radar', 'badges'] as const).map(key => (
            <button 
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === key ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
                {t(`tabs.${key}`)}
            </button>
            ))}
         </div>

         <div className="flex items-center gap-3">
            {tab !== 'badges' && (
                <SmartTooltip content={t(`system_explainer.${tab}` as any)} side="left">
                    <div className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white cursor-help border border-white/5">
                        <Info size={20} />
                    </div>
                </SmartTooltip>
            )}

            {onResume && (
                <Button onClick={onResume} className="btn-primary bg-white text-black hover:bg-gray-200 border-none shadow-xl">
                    <Play size={16} className="mr-2 fill-black" /> {tDash('resume')}
                </Button>
            )}
         </div>
      </div>

      {/* Podium (Always visible on top of Weighted for impact) */}
      {tab === 'weighted' && <Podium candidates={weightedResults} />}

      {/* Content */}
      <div className="glass-card p-6 min-h-[400px]">
        {tab === 'weighted' && <ChartsContainer data={weightedResults} />}
        
        {tab === 'schulze' && <SchulzeMatrix candidates={candidates} matrix={schulzeData.matrix} />}

        {tab === 'radar' && <RadarAnalysis candidates={candidates} factors={factors} votes={votes} />}

        {tab === 'badges' && (
            <VoterAnalysis 
                participants={participants} 
                votes={votes} 
                winnerId={weightedResults[0]?.candidate.id} 
            />
        )}
      </div>
    </div>
  );
};