'use client'
import { useState, useRef } from 'react';
import { createClient } from '@/shared/api/supabase';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useTranslations } from 'next-intl';
import { Upload, RefreshCw, X, Camera } from 'lucide-react';
import Image from 'next/image';

interface ProfileSetupProps {
  userId: string;
  onComplete: () => void;
}

export const ProfileSetup = ({ userId, onComplete }: ProfileSetupProps) => {
  const t = useTranslations('Profile');
  const tCommon = useTranslations('Common');
  
  const [nickname, setNickname] = useState('');
  const [seed, setSeed] = useState(userId);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCustomImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!nickname.trim()) return;
    setLoading(true);
    const metadata = customImage 
      ? { nickname, avatar_url: customImage, avatar_seed: null } 
      : { nickname, avatar_url: null, avatar_seed: seed };

    await supabase.auth.updateUser({ data: metadata });
    setLoading(false);
    onComplete();
  };

  const activeAvatar = customImage || `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030712] p-4">
      <div className="glass-card w-full max-w-md p-8 flex flex-col items-center gap-10 animate-in zoom-in-95 duration-500 border border-indigo-500/20 shadow-[0_0_100px_rgba(79,70,229,0.1)]">
        
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 tracking-tighter">
            {t('title')}
          </h2>
          <p className="text-gray-400 text-sm font-medium">{t('subtitle')}</p>
        </div>

        {/* Big Avatar Centerpiece */}
        <div className="relative group">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-indigo-500/30 shadow-2xl bg-black relative">
            <Image src={activeAvatar} alt="Avatar" fill className="object-cover" />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                {/* [FIX] Used translation key */}
                <span className="text-xs font-bold uppercase tracking-widest text-white">{t('change_avatar')}</span>
            </div>
          </div>

          {/* Action Buttons Floating Below */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
             <button 
                onClick={() => { setSeed(Math.random().toString()); setCustomImage(null); }}
                className="p-3 bg-gray-800 hover:bg-indigo-600 text-white rounded-full shadow-lg border border-gray-700 transition-all hover:scale-110"
                title={t('tap_shuffle')}
             >
                <RefreshCw size={18} />
             </button>
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-gray-800 hover:bg-indigo-600 text-white rounded-full shadow-lg border border-gray-700 transition-all hover:scale-110"
                title={t('upload_btn')} 
             >
                <Camera size={18} />
             </button>
             {customImage && (
               <button onClick={() => setCustomImage(null)} className="p-3 bg-red-900/80 hover:bg-red-600 text-white rounded-full shadow-lg border border-red-700 transition-all hover:scale-110">
                 <X size={18} />
               </button>
             )}
          </div>
        </div>

        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

        <div className="w-full space-y-6 mt-4">
          <Input 
            placeholder={tCommon('placeholder_name')} 
            value={nickname} 
            onChange={(e) => setNickname(e.target.value)}
            className="text-center font-bold text-2xl bg-transparent border-0 border-b-2 border-gray-800 focus:border-indigo-500 rounded-none px-0 py-2 focus:ring-0 placeholder:text-gray-700 transition-colors"
            autoFocus
          />

          <Button 
            onClick={handleSave} 
            disabled={!nickname.trim() || loading} 
            className="w-full btn-primary py-4 text-lg shadow-indigo-500/20"
          >
            {loading ? tCommon('loading') : tCommon('next')}
          </Button>
        </div>
      </div>
    </div>
  );
};