import { Candidate } from '@/entities/candidate/model/types';
import { SmartEntity } from '@/shared/ui/smart-entity';
import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';

interface JollySelectorProps {
  candidates: Candidate[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export const JollySelector = ({ candidates, selectedId, onSelect }: JollySelectorProps) => {
  const t = useTranslations('Voting');

  return (
    <div className="space-y-4 bg-gradient-to-r from-yellow-900/20 to-transparent p-6 rounded-2xl border border-yellow-500/30">
      <div className="flex items-center gap-2 text-yellow-400">
        <Sparkles className="animate-pulse" />
        <h3 className="font-bold text-lg">{t('jolly_title')}</h3>
      </div>
      <p className="text-sm text-yellow-200/60">{t('jolly_desc')}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        {candidates.map(c => {
          const isSelected = selectedId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(isSelected ? null : c.id)}
              className={`
                relative p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-3
                ${isSelected 
                  ? 'bg-yellow-500/20 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)] scale-105' 
                  : 'bg-gray-900/50 border-gray-700 hover:bg-gray-800 hover:border-gray-500'
                }
              `}
            >
              <SmartEntity 
                label="" 
                seed={c.id} 
                imageUrl={c.image_url} 
                className="pointer-events-none scale-125"
              />
              <span className={`text-xs font-bold truncate w-full text-center ${isSelected ? 'text-yellow-300' : 'text-gray-400'}`}>
                {c.name}
              </span>
              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">
                  JOLLY
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};