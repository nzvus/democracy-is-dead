'use client'

import { UI } from '@/lib/constants'

interface AvatarProps {
  src?: string | null     
  seed?: string           
  alt?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Avatar({ 
  src, 
  seed = 'user', 
  alt = 'Avatar', 
  className = '',
  size = 'md'
}: AvatarProps) {
  
  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  }

  
  if (src) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className={`rounded-full object-cover border border-gray-700 bg-gray-800 ${sizeClasses[size]} ${className}`}
      />
    )
  }

  
  
  const fallbackUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`

  return (
    <img 
      src={fallbackUrl} 
      alt={alt} 
      className={`rounded-full bg-gray-800 border border-gray-700 ${sizeClasses[size]} ${className}`}
    />
  )
}