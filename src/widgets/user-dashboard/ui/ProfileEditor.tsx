'use client'
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/shared/api/supabase';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ImagePicker } from '@/shared/ui/image-picker';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { Lock, User as UserIcon, Save } from 'lucide-react';

export const ProfileEditor = ({ user }: { user: User }) => {
  const t = useTranslations('Profile');
  const supabase = createClient();
  
  const [nickname, setNickname] = useState(user.user_metadata?.nickname || '');
  const [avatarUrl, setAvatarUrl] = useState(user.user_metadata?.avatar_url || null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const updates: any = {
        data: { nickname, avatar_url: avatarUrl }
      };

      if (password.trim()) {
        updates.password = password;
      }

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      toast.success(t('update_success'));
      setPassword(''); // Clear password field
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 w-full h-full animate-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
        <UserIcon className="text-indigo-400" />
        <h2 className="text-xl font-bold text-white">{t('title')}</h2>
      </div>

      <div className="space-y-8">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4">
            <ImagePicker 
                value={avatarUrl} 
                onChange={setAvatarUrl} 
                allowShuffle={true}
                seed={user.id}
                className="scale-125"
            />
        </div>

        {/* Form */}
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-gray-500 ml-1">{t('placeholder_name')}</label>
                <Input 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="glass-input"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-gray-500 ml-1 flex items-center gap-1">
                    <Lock size={10} /> {t('change_password')}
                </label>
                <Input 
                    type="password"
                    placeholder={t('new_password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input"
                />
            </div>

            <Button onClick={handleUpdate} isLoading={loading} className="w-full btn-primary mt-4">
                <Save size={16} className="mr-2" /> {t('update_btn')}
            </Button>
        </div>
      </div>
    </div>
  );
};