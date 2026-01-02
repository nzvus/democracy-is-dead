import React from 'react';
import { Candidate } from '../model/types';
import { SmartEntity } from '@/shared/ui/smart-entity';

interface CandidateCardProps {
  candidate: Candidate;
  onClick?: () => void;
  isSelected?: boolean;
  className?: string;
}

export const CandidateCard = ({ 
  candidate, 
  onClick, 
  isSelected, 
  className = '' 
}: CandidateCardProps) => {
  return (
    <div 
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border transition-all duration-200 
        flex items-center gap-4 group cursor-pointer
        ${isSelected 
          ? 'bg-indigo-900/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
          : 'bg-gray-900/50 border-gray-800 hover:border-gray-600 hover:bg-gray-800'
        }
        ${className}
      `}
    >
      <div className="shrink-0">
        <SmartEntity 
          seed={candidate.id} 
          label={candidate.name} 
          imageUrl={candidate.image_url} 
          className="pointer-events-none" // Text handling handled below for layout reasons
        />
      </div>
      
      <div className="min-w-0 flex-1">
        <h4 className={`font-bold truncate ${isSelected ? 'text-indigo-300' : 'text-gray-200'}`}>
          {candidate.name}
        </h4>
        {candidate.description && (
          <p className="text-xs text-gray-500 truncate">
            {candidate.description}
          </p>
        )}
      </div>
    </div>
  );
};