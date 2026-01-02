'use client'
import { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, X, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface ImagePickerProps {
  value: string | null;
  onChange: (val: string | null) => void;
  allowShuffle?: boolean; 
  seed?: string; 
  className?: string;
}

export const ImagePicker = ({ 
  value, 
  onChange, 
  allowShuffle, 
  seed,
  className = ""
}: ImagePickerProps) => {
  const t = useTranslations('Common');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentSeed, setCurrentSeed] = useState(seed || 'default');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onChange(reader.result as string);
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleShuffle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent clicks
    const newSeed = Math.random().toString();
    setCurrentSeed(newSeed);
    if (allowShuffle) onChange(`https://api.dicebear.com/9.x/avataaars/svg?seed=${newSeed}`);
  };

  const handleUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const hasCustomImage = value && (value.startsWith('data:') || value.startsWith('http'));
  const displaySrc = hasCustomImage ? value : (allowShuffle ? `https://api.dicebear.com/9.x/avataaars/svg?seed=${currentSeed}` : null);

  return (
    <div className={`relative group ${className}`}>
      {/* Increased default size from min-w-[3rem] to min-w-[5rem] and added consistent sizing */}
      <div className="w-full h-full min-w-[5rem] min-h-[5rem] rounded-xl overflow-hidden bg-gray-900 border border-gray-700 shadow-inner flex items-center justify-center relative aspect-square">
        {displaySrc ? (
          <Image src={displaySrc} alt="Preview" fill className="object-cover" />
        ) : (
          <ImageIcon className="text-gray-600 w-1/3 h-1/3" />
        )}
        
        {/* Overlay Actions - Always visible on hover, darker background */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
          <button 
            onClick={handleUpload}
            className="p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 transition-transform hover:scale-110 shadow-lg"
            title={t('upload_image')}
            type="button"
          >
            <Upload size={16} />
          </button>
          
          {allowShuffle && (
            <button 
                onClick={handleShuffle}
                className="p-2 bg-gray-700 rounded-full text-white hover:bg-gray-600 transition-transform hover:scale-110 shadow-lg"
                title={t('shuffle')}
                type="button"
            >
                <RefreshCw size={16} />
            </button>
          )}

          {displaySrc && (
            <button 
                onClick={handleRemove}
                className="p-2 bg-red-600 rounded-full text-white hover:bg-red-500 transition-transform hover:scale-110 shadow-lg"
                title={t('remove_image')}
                type="button"
            >
                <X size={16} />
            </button>
          )}
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
    </div>
  );
};