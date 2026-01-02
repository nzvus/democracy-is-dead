import { useTranslations } from 'next-intl';
import { Info, BookOpen, GitMerge, Radar } from 'lucide-react';

export const MethodExplainer = ({ method }: { method: 'weighted' | 'schulze' | 'radar' }) => {
  const t = useTranslations('Results');

  const content = {
    weighted: {
      icon: <Info className="text-blue-400" size={24} />,
      title: "Weighted Sum Model",
      history: "Developed in the 1970s for Multi-Criteria Decision Analysis (MCDA).",
      math: "Sums up normalized scores multiplied by factor weights. Good for measuring intensity of preference.",
      insight: "Best when you care about specific criteria (e.g. Price vs Quality)."
    },
    schulze: {
      icon: <GitMerge className="text-yellow-400" size={24} />,
      title: "Schulze Method (Beatpath)",
      history: "Created by Markus Schulze in 1997. Used by Debian, Ubuntu, and Pirate Parties.",
      math: "Simulates 1-on-1 duels between every candidate pair. It finds the strongest path of victories to determine the Condorcet winner.",
      insight: "Best for finding the 'truest' winner that minimizes dissatisfaction. Immune to spoilers."
    },
    radar: {
      icon: <Radar className="text-pink-400" size={24} />,
      title: "Radar Analysis (Star Plot)",
      history: "Invented by Georg von Mayr in 1877.",
      math: "Visualizes multivariate data on a 2D chart.",
      insight: "Use this to spot candidates with 'Fatal Flaws' (e.g. High average score, but zero safety)."
    }
  };

  const info = content[method] || content.weighted;

  return (
    <div className="mt-6 bg-black/20 border border-white/10 rounded-xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <BookOpen size={100} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
            {info.icon}
            <h3 className="text-lg font-bold text-white">{info.title}</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
                {/* [FIX] Used translation key */}
                <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-1">{t('history_label')}</h4>
                <p className="text-gray-300 leading-relaxed">{info.history}</p>
            </div>
            <div>
                {/* [FIX] Used translation key */}
                <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-1">{t('math_label')}</h4>
                <p className="text-gray-300 leading-relaxed">{info.math}</p>
            </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/5">
            {/* [FIX] Used translation key & unicode bulb */}
            <p className="text-indigo-300 text-xs font-medium">{'\uD83D\uDCA1'} {t('insight_label')}: {info.insight}</p>
        </div>
      </div>
    </div>
  );
};