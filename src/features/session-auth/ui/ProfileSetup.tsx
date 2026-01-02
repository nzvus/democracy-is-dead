'use client'
import { useState } from 'react';
import { createClient } from '@/shared/api/supabase';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { UniversalImagePicker } from '@/shared/ui/image-picker';
import { useTranslations } from 'next-intl';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030712]/90 p-4">
      <div className="glass-card w-full max-w-sm p-8 flex flex-col items-center gap-8 animate-in zoom-in-95 duration-500 border border-indigo-500/20">
        
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            {t('title')}
          </h2>
          <p className="text-gray-500 text-sm">{t('subtitle')}</p>
        </div>

        <UniversalImagePicker 
          value={avatarUrl} 
          onChange={setAvatarUrl} 
          allowShuffle={true} 
          seed={userId}
          className="scale-125"
        />

        <div className="w-full space-y-4">
          <Input 
            placeholder={tCommon('placeholder_name')} 
            value={nickname} 
            onChange={(e) => setNickname(e.target.value)}
            className="text-center font-bold text-lg bg-black/40 border-indigo-500/30 focus:border-indigo-500 text-white"
            autoFocus
          />

          <Button 
            onClick={handleSave} 
            disabled={!nickname.trim() || loading} 
            className="w-full btn-primary"
          >
            {loading ? tCommon('loading') : tCommon('next')}
          </Button>
        </div>
      </div>
    </div>
  );
};