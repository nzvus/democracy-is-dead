import React from 'react';
import Image from 'next/image'; // [FIX]
import { CONSTANTS } from '@/shared/config/constants';

interface SmartEntityProps {
  label: string;
  imageUrl?: string | null;
  seed: string;
  isMasked?: boolean;
  fallbackLabel?: string;
  className?: string;
}

export const SmartEntity = ({
  label,
  imageUrl,
  seed,
  isMasked = false,
  fallbackLabel = "Anonymous",
  className = ""
}: SmartEntityProps) => {
  
  const displayLabel = isMasked ? fallbackLabel : label;
  const shouldUseRealImage = !isMasked && imageUrl;
  
  const avatarSrc = shouldUseRealImage 
    ? imageUrl!
    : `${CONSTANTS.defaults.AVATAR_API}${seed}`;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800 border border-gray-700 shrink-0">
        <Image 
          src={avatarSrc} 
          alt={displayLabel} 
          fill
          sizes="40px"
          className="object-cover"
        />
      </div>
      <span className={`font-medium truncate ${isMasked ? "italic opacity-60" : "text-gray-200"}`}>
        {displayLabel}
      </span>
    </div>
  );
};