import React from 'react';
import { Candidate } from '@/entities/candidate/model/types';
import { Factor } from '@/entities/factor/model/types';
import { SmartEntity } from '@/shared/ui/smart-entity';
import { SmartTooltip } from '@/shared/ui/tooltip';
import { useTranslations } from 'next-intl';
import { Star, ArrowDown, ArrowUp } from 'lucide-react';
import Image from 'next/image';

interface VotingCardProps {
  candidate: Candidate;
  factors: Factor[];
  votes: Record<string, number>;
  maxScale: number;
  onVote: (factorId: string, value: number) => void;
}

export const VotingCard = ({ candidate, factors, votes, maxScale, onVote }: VotingCardProps) => {
  const t = useTranslations('Voting');
  const tCommon = useTranslations('Common'); // [FIX]

  const votingFactors = factors.filter(f => !f.is_hidden && f.type === 'numerical');
  const constantFactors = factors.filter(f => !f.is_hidden && f.type === 'constant');

  const getGradientColor = (value: number, weight: number) => {
    const percent = value / maxScale;
    const isPositive = weight >= 0;
    const hue = isPositive ? percent * 120 : 120 - (percent * 120);
    return `hsla(${hue}, 70%, 40%, 0.2)`;
  };

  const renderInput = (factor: Factor, value: number) => {
    const bgStyle = { backgroundColor: getGradientColor(value, factor.weight) };
    const commonClasses = "w-full rounded-lg transition-colors duration-300 p-2 border border-white/5";

    switch (factor.input_control) {
      case 'stars':
        return (
          <div className={`${commonClasses} flex justify-center gap-1`} style={bgStyle}>
            {[1, 2, 3, 4, 5].map((star) => {
              const threshold = star * (maxScale / 5);
              const isActive = value >= threshold;
              return (
                <button
                  key={star}
                  onClick={() => onVote(factor.id, threshold)}
                  className={`transition-all hover:scale-125 ${isActive ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                >
                  <Star size={20} />
                </button>
              );
            })}
          </div>
        );
      case 'toggle':
        return (
          <div className={`${commonClasses} flex gap-2`} style={bgStyle}>
            <button onClick={() => onVote(factor.id, maxScale)} className={`flex-1 py-1.5 rounded text-xs font-bold ${value === maxScale ? 'bg-white text-black shadow-lg' : 'bg-black/20 text-gray-400'}`}>
                {tCommon('yes')} {/* [FIX] */}
            </button>
            <button onClick={() => onVote(factor.id, 0)} className={`flex-1 py-1.5 rounded text-xs font-bold ${value === 0 ? 'bg-white text-black shadow-lg' : 'bg-black/20 text-gray-400'}`}>
                {tCommon('no')} {/* [FIX] */}
            </button>
          </div>
        );
      case 'number':
        return (
          <div className={commonClasses} style={bgStyle}>
             <input
              type="number"
              min={0} max={maxScale}
              value={value || 0}
              onChange={(e) => onVote(factor.id, Number(e.target.value))}
              className="w-full bg-transparent text-center font-mono font-bold text-white outline-none"
            />
          </div>
        );
      case 'slider':
      default:
        return (
          <div className={`${commonClasses} space-y-2`} style={bgStyle}>
             <div className="flex justify-between text-[10px] font-bold text-white/70 px-1">
               <span>0</span>
               <span className="text-white scale-110">{value.toFixed(1)}</span>
               <span>{maxScale}</span>
             </div>
             <input 
                type="range"
                min={0} max={maxScale} step={1}
                value={value}
                onChange={(e) => onVote(factor.id, Number(e.target.value))}
                className="w-full h-1.5 bg-black/30 rounded-lg appearance-none cursor-pointer accent-white"
              />
          </div>
        );
    }
  };

  return (
    <div className="glass-card p-6 hover:border-indigo-500/30 transition-all duration-300 group">
      <div className="flex items-start gap-4 mb-6">
        <SmartEntity label={candidate.name} seed={candidate.id} imageUrl={candidate.image_url} className="pointer-events-none scale-110" />
        <div className="min-w-0 flex-1">
          <div className="flex justify-between items-start">
             <SmartTooltip content={candidate.description}>
                <h3 className="font-bold text-lg text-white truncate cursor-help decoration-dotted underline-offset-4 hover:underline">
                    {candidate.name}
                </h3>
             </SmartTooltip>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {constantFactors.map(f => (
              <SmartTooltip key={f.id} content={f.description}>
                <span className="text-[10px] bg-gray-800/80 text-gray-300 px-2 py-1 rounded border border-gray-700 flex items-center gap-1 cursor-help">
                    {/* [FIX] Use Next/Image */}
                    {f.image_url && <Image src={f.image_url} width={12} height={12} className="rounded-full" alt="" />}
                    {f.name}: <span className="font-mono font-bold text-white">{candidate.static_values?.[f.id] ?? '-'}</span>
                </span>
              </SmartTooltip>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {votingFactors.map(factor => (
          <div key={factor.id} className="space-y-1">
            <div className="flex justify-between items-center px-1">
                <SmartTooltip content={factor.description}>
                    <label className="text-xs font-bold uppercase text-gray-400 flex items-center gap-1 cursor-help hover:text-white transition-colors">
                        {factor.name}
                        {factor.weight < 0 ? <ArrowDown size={12} className="text-red-400" /> : <ArrowUp size={12} className="text-green-400" />}
                    </label>
                </SmartTooltip>
                {/* [FIX] Used translation key */}
                <span className={`text-[10px] font-mono ${factor.weight < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {t('weight_impact', { val: factor.weight })}
                </span>
            </div>
            {renderInput(factor, votes[factor.id] ?? 0)}
          </div>
        ))}
      </div>
    </div>
  );
};