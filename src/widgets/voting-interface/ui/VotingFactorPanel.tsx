import React, { useState } from 'react';
import { Candidate } from '@/entities/candidate/model/types';
import { Factor } from '@/entities/factor/model/types';
import { useTranslations } from 'next-intl';
import { ChevronDown, Star, ArrowUp, ArrowDown, EyeOff } from 'lucide-react';
import { SmartEntity } from '@/shared/ui/smart-entity';
import Image from 'next/image';
import { useLobbyStore } from '@/entities/lobby/model/lobby-store'; // Need access to lobby settings

interface VotingFactorPanelProps {
  factor: Factor;
  candidates: Candidate[];
  votes: Record<string, number>; 
  maxScale: number;
  onVote: (candidateId: string, value: number) => void;
}

export const VotingFactorPanel = ({ factor, candidates, votes, maxScale, onVote }: VotingFactorPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const t = useTranslations('Voting');
  const tCommon = useTranslations('Common');
  
  // Access global store to get privacy settings
  const lobby = useLobbyStore((s) => s.lobby);
  const privacy = lobby?.settings?.privacy;
  
  // Determine Visibility
  // Type guard for privacy object (it can be string 'public'/'anonymous' or object)
  const isCandidateMasked = (typeof privacy === 'object' && privacy?.candidates === 'hidden');
  const isFactorMasked = (typeof privacy === 'object' && privacy?.factors === 'hidden');

  const factorName = isFactorMasked ? t('anon_factor') : factor.name;
  const factorDesc = isFactorMasked ? "???" : factor.description;
  const factorImage = isFactorMasked ? null : factor.image_url;

  const getColor = (value: number) => {
    const percent = value / maxScale;
    const isPositive = factor.weight >= 0;
    const hue = isPositive ? percent * 120 : 120 - (percent * 120);
    return `hsl(${hue}, 70%, 50%)`;
  };

  const renderInput = (candidateId: string, value: number) => {
    const commonStyle = { accentColor: getColor(value) };

    switch (factor.input_control) {
      case 'stars':
        return (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => onVote(candidateId, s * (maxScale / 5))}>
                <Star 
                  size={24} 
                  className={`transition-all ${value >= s * (maxScale / 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-700'}`} 
                />
              </button>
            ))}
          </div>
        );
      case 'toggle':
        return (
          <div className="flex bg-black/40 rounded-lg p-1 gap-1">
            <button onClick={() => onVote(candidateId, maxScale)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${value === maxScale ? 'bg-green-500 text-black' : 'text-gray-400'}`}>{tCommon('yes')}</button>
            <button onClick={() => onVote(candidateId, 0)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${value === 0 ? 'bg-red-500 text-white' : 'text-gray-400'}`}>{tCommon('no')}</button>
          </div>
        );
      case 'number':
        return (
          <input 
            type="number" 
            min={0} max={maxScale} 
            step={factor.step}
            value={value}
            onChange={(e) => onVote(candidateId, Number(e.target.value))}
            className="w-20 bg-black/40 border border-gray-700 rounded-lg px-2 py-1 text-center font-mono text-white"
          />
        );
      default:
        return (
          <div className="flex-1 flex items-center gap-4">
            <input 
              type="range" 
              min={0} max={maxScale} 
              step={factor.step}
              value={value}
              onChange={(e) => onVote(candidateId, Number(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              style={commonStyle}
            />
            <span className="font-mono font-bold w-8 text-right" style={{ color: getColor(value) }}>
              {value}
            </span>
          </div>
        );
    }
  };

  return (
    <div className="glass-card overflow-hidden transition-all duration-500 border-l-4 border-l-indigo-500/50">
      {/* Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          {factorImage ? (
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-900 border border-gray-700">
               <Image src={factorImage} alt="" width={40} height={40} className="object-cover w-full h-full" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-gray-500">
                {isFactorMasked ? <EyeOff size={16} /> : (factor.name ? factor.name.charAt(0) : '?')}
            </div>
          )}
          
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
                {factorName}
                {!isFactorMasked && (factor.weight < 0 ? <ArrowDown size={14} className="text-red-400" /> : <ArrowUp size={14} className="text-green-400" />)}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-1">{factorDesc || t('expand_to_vote')}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
            {!isOpen && (
                <div className="flex gap-0.5 h-6 items-end opacity-70">
                    {candidates.map(c => (
                        <div 
                            key={c.id} 
                            className="w-2 rounded-t-sm transition-all"
                            style={{ 
                                height: `${((votes[c.id] || 0) / maxScale) * 100}%`,
                                backgroundColor: getColor(votes[c.id] || 0),
                                minHeight: '4px'
                            }}
                        />
                    ))}
                </div>
            )}
            <ChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Expanded Body */}
      {isOpen && (
        <div className="border-t border-white/5 bg-black/10">
            {candidates.map((cand, idx) => {
                // Determine Anonymization per Candidate
                const cLabel = isCandidateMasked ? t('anon_candidate', { index: idx + 1 }) : cand.name;
                const cImage = isCandidateMasked ? null : cand.image_url;
                const cSeed = isCandidateMasked ? `masked-${idx}` : cand.id;

                return (
                    <div key={cand.id} className="p-4 flex items-center gap-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                        <div className="w-16 flex justify-center shrink-0">
                            <SmartEntity 
                                label="" 
                                seed={cSeed} 
                                imageUrl={cImage} 
                                isMasked={isCandidateMasked}
                                className="scale-125"
                            />
                        </div>
                        
                        <div className="flex-1">
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-bold text-gray-200">{cLabel}</span>
                                
                                {/* Show constant value if this is a constant factor */}
                                {factor.type === 'constant' && (
                                    <span className="text-xs font-mono text-indigo-300">
                                        {isFactorMasked ? '***' : (cand.static_values?.[factor.id] ?? '-')}
                                    </span>
                                )}
                            </div>
                            
                            {/* Render input if numerical */}
                            {factor.type === 'numerical' && renderInput(cand.id, votes[cand.id] ?? 0)}
                        </div>
                    </div>
                );
            })}
        </div>
      )}
    </div>
  );
};