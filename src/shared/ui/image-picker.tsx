'use client'
import { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, X, RefreshCw, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { uploadImage } from '@/shared/lib/image-upload'; // [NEW]
import { toast } from 'sonner';

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
  const t = useTranslations('Common'); // Ensure translations exist
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentSeed, setCurrentSeed] = useState(seed || 'default');
  const [isUploading, setIsUploading] = useState(false); // [NEW] Loading state

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        // [FIX] Compress & Upload to Cloud
        const publicUrl = await uploadImage(file);
        onChange(publicUrl);
      } catch (error) {
        toast.error("Failed to upload image");
      } finally {
        setIsUploading(false);
      }
    }
    e.target.value = '';
  };

  const handleShuffle = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Logic: Value takes precedence. If no value, check if shuffle allowed.
  const displaySrc = value || (allowShuffle ? `https://api.dicebear.com/9.x/avataaars/svg?seed=${currentSeed}` : null);

  return (
    <div className={`relative group ${className}`}>
      <div className="w-full h-full min-w-[5rem] min-h-[5rem] rounded-xl overflow-hidden bg-gray-900 border border-gray-700 shadow-inner flex items-center justify-center relative aspect-square">
        
        {isUploading ? (
          <Loader2 className="animate-spin text-indigo-500" />
        ) : displaySrc ? (
          <Image 
            src={displaySrc} 
            alt="Preview" 
            fill 
            className="object-cover" 
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <ImageIcon className="text-gray-600 w-1/3 h-1/3" />
        )}
        
        {/* Overlay Actions */}
        <div className={`absolute inset-0 bg-black/70 transition-opacity flex items-center justify-center gap-2 z-10 ${isUploading ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}>
          <button 
            onClick={handleUpload}
            className="p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 transition-transform hover:scale-110 shadow-lg"
            title="Upload"
            type="button"
          >
            <Upload size={16} />
          </button>
          
          {allowShuffle && (
            <button 
                onClick={handleShuffle}
                className="p-2 bg-gray-700 rounded-full text-white hover:bg-gray-600 transition-transform hover:scale-110 shadow-lg"
                title="Shuffle"
                type="button"
            >
                <RefreshCw size={16} />
            </button>
          )}

          {displaySrc && (
            <button 
                onClick={handleRemove}
                className="p-2 bg-red-600 rounded-full text-white hover:bg-red-500 transition-transform hover:scale-110 shadow-lg"
                title="Remove"
                type="button"
            >
                <X size={16} />
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