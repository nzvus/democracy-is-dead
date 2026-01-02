import Image from 'next/image';
import { User, Image as ImageIcon } from 'lucide-react';

interface AvatarContainerProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  seed?: string; // Fallback seed for dicebear
}

export const AvatarContainer = ({ src, alt, size = 'md', className = "", seed }: AvatarContainerProps) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-32 h-32"
  };

  // Determine Source: Custom Upload -> DiceBear -> Placeholder
  const finalSrc = src 
    ? src 
    : (seed ? `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}` : null);

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-gray-900 border border-white/10 shadow-inner flex items-center justify-center shrink-0 ${sizes[size]} ${className}`}>
      {finalSrc ? (
        <Image 
          src={finalSrc} 
          alt={alt} 
          fill 
          className="object-cover" 
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        <User className="text-gray-600" />
      )}
    </div>
  );
};