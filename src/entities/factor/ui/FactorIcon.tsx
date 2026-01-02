import React from 'react';
import Image from 'next/image';
import { Factor } from '../model/types';

interface FactorIconProps {
  factor: Factor;
  className?: string;
}

export const FactorIcon = ({ factor, className = "w-10 h-10" }: FactorIconProps) => {
  if (factor.image_url) {
    return (
      <div className={`relative rounded-lg overflow-hidden bg-gray-800 border border-gray-700 ${className}`}>
        <Image 
          src={factor.image_url} 
          alt={factor.name} 
          fill
          sizes="40px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`rounded-lg flex items-center justify-center bg-gray-800 border border-gray-700 font-bold text-gray-400 ${className}`}>
      {factor.name.charAt(0).toUpperCase()}
    </div>
  );
};