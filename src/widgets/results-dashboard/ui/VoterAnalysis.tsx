import { Participant } from '@/entities/participant/model/types';
import { calculateBadges, BadgeType } from '@/entities/participant/model/badges';
import { AvatarContainer } from '@/shared/ui/avatar-container';
import { SmartTooltip } from '@/shared/ui/tooltip';
import { useTranslations } from 'next-intl';
import { Brain, Heart, Frown, Sparkles, TrendingUp } from 'lucide-react';

interface VoterAnalysisProps {
  participants: Participant[];
  votes: any[];
  winnerId?: string; 
}

const BadgeIcon = ({ type }: { type: BadgeType }) => {
  switch(type) {
    case 'hater': return <Frown size={16} className="text-red-400" />;
    case 'lover': return <Heart size={16} className="text-pink-400" />;
    case 'oracle': return <Sparkles size={16} className="text-yellow-400" />;
    case 'contrarian': return <TrendingUp size={16} className="text-orange-400" />;
    case 'hive_mind': return <Brain size={16} className="text-indigo-400" />;
    default: return null;
  }
};

export const VoterAnalysis = ({ participants, votes, winnerId }: VoterAnalysisProps) => {
  const t = useTranslations('Results');
  
  // [FIX] Removed 3rd argument to match function signature
  const badgesMap = calculateBadges(votes, winnerId || ""); 

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        {t('badges_title')}
      </h3>

      <div className="grid gap-3">
        {participants.filter(p => p.has_voted).map(p => {
          const userBadges = badgesMap[p.user_id] || [];
          const userVoteCount = votes.filter(v => v.voter_id === p.user_id).length;

          return (
            <div key={p.user_id} className="flex items-center justify-between bg-gray-900/40 border border-white/5 rounded-xl p-4 hover:bg-white/5 transition-colors">
              
              <div className="flex items-center gap-4">
                <AvatarContainer 
                    src={p.avatar_url} 
                    alt={p.nickname} 
                    seed={p.user_id} 
                    className="ring-2 ring-indigo-500/30"
                />
                <div>
                    <div className="font-bold text-gray-200">{p.nickname}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                        {userVoteCount > 0 ? "Voted" : "Spectating"}
                    </div>
                </div>
              </div>

              <div className="flex gap-2">
                {userBadges.map(badge => (
                    <SmartTooltip key={badge} content={`${t(`badges_list.${badge}.title`)}: ${t(`badges_list.${badge}.desc`)}`}>
                        <div className="p-2 bg-black/40 rounded-lg border border-white/10 hover:border-white/30 cursor-help transition-colors">
                            <BadgeIcon type={badge} />
                        </div>
                    </SmartTooltip>
                ))}
              </div>

            </div>
          );
        })}
        {participants.filter(p => p.has_voted).length === 0 && (
            // [FIX] Used translation key
            <div className="text-center text-gray-500 py-10 italic">{t('no_data')}</div>
        )}
      </div>
    </div>
  );
};