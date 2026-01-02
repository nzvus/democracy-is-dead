'use client'
import { useState, useRef } from 'react';
import { createClient } from '@/shared/api/supabase';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
// [FIX] Updated import to ImagePicker
import { ImagePicker } from '@/shared/ui/image-picker';
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(`https://api.dicebear.com/9.x/avataaars/svg?seed=${userId}`);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSave = async () => {
    if (!nickname.trim()) return;
    setLoading(true);
    
    await supabase.auth.updateUser({
      data: { nickname, avatar_url: avatarUrl }
    });
    
    setLoading(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030712] p-4">
      <div className="glass-card w-full max-w-md p-8 flex flex-col items-center gap-10 animate-in zoom-in-95 duration-500 border border-indigo-500/20 shadow-[0_0_100px_rgba(79,70,229,0.1)]">
        
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 tracking-tighter">
            {t('title')}
          </h2>
          <p className="text-gray-400 text-sm font-medium">{t('subtitle')}</p>
        </div>

        {/* Using the new ImagePicker for consistency */}
        <div className="w-40 h-40">
            <ImagePicker 
                value={avatarUrl} 
                onChange={setAvatarUrl} 
                allowShuffle={true} 
                seed={userId}
                className="w-full h-full rounded-full border-4 border-indigo-500/30 shadow-2xl" 
            />
        </div>

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