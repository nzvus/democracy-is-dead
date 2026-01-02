import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Candidate } from '@/entities/candidate/model/types';
import { Factor } from '@/entities/factor/model/types';
import { VotingFactorPanel } from './VotingFactorPanel'; // [NEW]
import { JollySelector } from './JollySelector';
import { useCastVote } from '@/features/cast-vote/model/useCastVote';
import { Button } from '@/shared/ui/button';

interface VotingInterfaceProps {
  lobbyId: string;
  userId: string;
  candidates: Candidate[];
  factors: Factor[];
  maxScale: number;
}

export const VotingInterface = ({ 
  lobbyId, userId, candidates, factors, maxScale 
}: VotingInterfaceProps) => {
  const t = useTranslations('Voting');
  const { localVotes, registerVote, commitVotes, isSubmitting } = useCastVote(lobbyId, userId);
  const [jollyId, setJollyId] = useState<string | null>(null);

  // Helper to invert the map: We need Candidate Votes grouped by Factor for the Panel
  // But localVotes is Record<CandidateId, Record<FactorId, Score>>
  // The panel needs logic to pull score: votes[candidateId][factor.id]
  const getVotesForFactor = (factorId: string) => {
    const map: Record<string, number> = {};
    candidates.forEach(c => {
        map[c.id] = localVotes[c.id]?.[factorId] ?? 0;
    });
    return map;
  };

  const activeFactors = factors.filter(f => !f.is_hidden && f.type === 'numerical');

  return (
    <div className="space-y-8 pb-40 max-w-3xl mx-auto"> {/* [FIX] Centered Container */}
      
      <JollySelector 
        candidates={candidates} 
        selectedId={jollyId} 
        onSelect={setJollyId} 
      />

      <div className="space-y-4">
        {activeFactors.map(factor => (
          <VotingFactorPanel
            key={factor.id}
            factor={factor}
            candidates={candidates}
            maxScale={maxScale}
            votes={getVotesForFactor(factor.id)}
            onVote={(candId, val) => registerVote(candId, factor.id, val)}
          />
        ))}
      </div>

      <div className="fixed bottom-0 left-0 w-full p-6 bg-[#030712]/90 backdrop-blur-xl border-t border-white/10 z-40">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={commitVotes} 
            isLoading={isSubmitting} 
            className="w-full btn-primary py-4 text-lg shadow-2xl"
          >
            {t('submit')}
          </Button>
        </div>
      </div>
    </div>
  );
};