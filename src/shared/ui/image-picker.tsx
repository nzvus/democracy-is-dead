'use client'
import { useState, useRef } from 'react';
import { Button } from '@/shared/ui/button';
import { Image as ImageIcon, Upload, X, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface UniversalImagePickerProps {
  value: string | null;
  onChange: (val: string | null) => void;
  allowShuffle?: boolean; // For Avatars
  seed?: string; // Seed for shuffle
  className?: string;
}

export const UniversalImagePicker = ({ 
  value, 
  onChange, 
  allowShuffle, 
  seed,
  className = ""
}: UniversalImagePickerProps) => {
  const t = useTranslations('Common');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for shuffle logic
  const [currentSeed, setCurrentSeed] = useState(seed || 'default');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string); // Save as Base64
      };
      reader.readAsDataURL(file);
    }
    // [FIX] Reset input value so same file can be selected again if removed
    e.target.value = '';
  };

  const handleRemove = () => {
    onChange(null);
  };

  const handleShuffle = () => {
    const newSeed = Math.random().toString();
    setCurrentSeed(newSeed);
    // If we are shuffling, we are essentially "removing" the custom uploaded image
    // and falling back to the seed-based URL logic handled by parent or here.
    // However, usually "Shuffle" implies generating a DiceBear URL.
    if (allowShuffle) {
        onChange(`https://api.dicebear.com/9.x/avataaars/svg?seed=${newSeed}`);
    }
  };

  // Determine what to show
  const hasCustomImage = value && (value.startsWith('data:') || value.startsWith('http'));
  const displaySrc = hasCustomImage ? value : (allowShuffle ? `https://api.dicebear.com/9.x/avataaars/svg?seed=${currentSeed}` : null);

  return (
    <div className={`relative group ${className}`}>
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-900 border border-gray-700 shadow-inner flex items-center justify-center relative">
        {displaySrc ? (
          <Image src={displaySrc} alt="Preview" fill className="object-cover" />
        ) : (
          <ImageIcon className="text-gray-600" size={24} />
        )}
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 transition-transform hover:scale-110"
            title={t('upload_image')}
            type="button"
          >
            <Upload size={14} />
          </button>
          
          {allowShuffle && (
            <button 
                onClick={handleShuffle}
                className="p-1.5 bg-gray-700 rounded-full text-white hover:bg-gray-600 transition-transform hover:scale-110"
                title={t('shuffle')}
                type="button"
            >
                <RefreshCw size={14} />
            </button>
          )}

          {displaySrc && (
            <button 
                onClick={handleRemove}
                className="p-1.5 bg-red-600 rounded-full text-white hover:bg-red-500 transition-transform hover:scale-110"
                title={t('remove_image')}
                type="button"
            >
                <X size={14} />
            </button>
          )}
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
    </div>
  );
};