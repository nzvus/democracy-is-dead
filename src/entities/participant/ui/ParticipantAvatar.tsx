import React from 'react';
import { SmartEntity } from '@/shared/ui/smart-entity';

interface Participant {
  user_id: string;
  nickname: string;
  avatar_url?: string | null;
}

interface ParticipantAvatarProps {
  participant: Participant;
  isPrivacyMode?: boolean; // If true, masks name and avatar
  className?: string;
  showLabel?: boolean;
}

export const ParticipantAvatar = ({ 
  participant, 
  isPrivacyMode = false, 
  className = "",
  showLabel = true
}: ParticipantAvatarProps) => {
  
  if (!showLabel) {
    // Just the image (masked if needed)
    return (
      <SmartEntity 
        label="" // Label hidden via css/layout in this mode usually, or we just want the circle
        imageUrl={participant.avatar_url}
        seed={participant.user_id}
        isMasked={isPrivacyMode}
        className={className}
      />
    );
  }

  return (
    <SmartEntity 
      label={participant.nickname}
      imageUrl={participant.avatar_url}
      seed={participant.user_id}
      isMasked={isPrivacyMode}
      fallbackLabel="Anonymous Voter"
      className={className}
    />
  );
};