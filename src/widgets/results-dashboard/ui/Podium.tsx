import { Candidate } from '@/entities/candidate/model/types';
import { AvatarContainer } from '@/shared/ui/avatar-container';
import { useTranslations } from 'next-intl';
import { Trophy } from 'lucide-react';

interface PodiumProps {
  candidates: { candidate: Candidate; score: number }[];
}

// [FIX] Ensure "export const Podium" is present
export const Podium = ({ candidates }: PodiumProps) => {
  const t = useTranslations('Results');
  if (candidates.length === 0) return null;

  const [first, second, third] = candidates;

  return (
    <div className="flex justify-center items-end gap-4 h-64 mb-12 px-4">
      
      {/* 2nd Place */}
      {second && (
        <div className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-8 duration-700 delay-100">
          <AvatarContainer src={second.candidate.image_url} alt={second.candidate.name} size="md" seed={second.candidate.id} className="border-gray-400 border-2" />
          <div className="flex flex-col items-center w-24 md:w-32 bg-gradient-to-t from-gray-800 to-gray-700/50 rounded-t-xl p-4 border-t-4 border-gray-400 h-32 justify-end">
            <span className="text-2xl font-black text-gray-500/50">2</span>
            <span className="font-bold text-xs text-gray-300 truncate w-full text-center">{second.candidate.name}</span>
            <span className="text-[10px] font-mono opacity-70">{second.score.toFixed(1)}</span>
          </div>
        </div>
      )}

      {/* 1st Place */}
      <div className="flex flex-col items-center gap-3 animate-in slide-in-from-bottom-8 duration-700 z-10">
        <div className="relative">
            <Trophy className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" size={32} />
            <AvatarContainer src={first.candidate.image_url} alt={first.candidate.name} size="lg" seed={first.candidate.id} className="border-yellow-400 border-4 shadow-[0_0_30px_rgba(250,204,21,0.3)]" />
        </div>
        <div className="flex flex-col items-center w-28 md:w-40 bg-gradient-to-t from-yellow-900/40 to-yellow-600/20 rounded-t-xl p-4 border-t-4 border-yellow-400 h-44 justify-end shadow-2xl">
            <span className="text-4xl font-black text-yellow-500/20">1</span>
            <span className="font-black text-sm text-yellow-100 truncate w-full text-center uppercase tracking-widest">{first.candidate.name}</span>
            <span className="text-lg font-mono font-bold text-yellow-400">{first.score.toFixed(1)}</span>
        </div>
      </div>

      {/* 3rd Place */}
      {third && (
        <div className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-8 duration-700 delay-200">
          <AvatarContainer src={third.candidate.image_url} alt={third.candidate.name} size="md" seed={third.candidate.id} className="border-orange-700 border-2" />
          <div className="flex flex-col items-center w-24 md:w-32 bg-gradient-to-t from-orange-900/30 to-orange-800/20 rounded-t-xl p-4 border-t-4 border-orange-700 h-24 justify-end">
            <span className="text-2xl font-black text-orange-800/50">3</span>
            <span className="font-bold text-xs text-orange-200/70 truncate w-full text-center">{third.candidate.name}</span>
            <span className="text-[10px] font-mono opacity-70">{third.score.toFixed(1)}</span>
          </div>
        </div>
      )}
    </div>
  );
};