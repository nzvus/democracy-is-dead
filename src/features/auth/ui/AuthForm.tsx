'use client'
import { useState } from 'react';
import { createClient } from '@/shared/api/supabase';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface AuthFormProps {
  onSuccess: () => void;
}

export const AuthForm = ({ onSuccess }: AuthFormProps) => {
  const t = useTranslations('Auth');
  const tCommon = useTranslations('Common');
  
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);

    // Create a consistent fake email
    const email = `${username.trim().toLowerCase().replace(/\s+/g, '')}@did.app`;

    try {
      if (isLogin) {
        // LOGIN
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        // SIGN UP
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { nickname: username } } 
        });
        
        if (error) throw error;
        
        // [FIX] Check if session was created. If not, Email Confirm is likely ON.
        if (!data.session) {
            throw new Error("CONFIRMATION_REQUIRED");
        }
      }
      
      onSuccess();
    } catch (err: any) {
      console.error("Auth Error:", err);
      
      if (err.message === 'CONFIRMATION_REQUIRED') {
          toast.error("Error: You must disable 'Confirm Email' in Supabase Dashboard -> Auth -> Providers.");
      } else if (err.message.includes('Invalid login')) {
          toast.error(t('error_creds'));
      } else if (err.message.includes('already registered')) {
          toast.error("Username already taken. Try logging in.");
      } else {
          toast.error(t('error_generic'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 w-full max-w-sm mx-auto animate-in fade-in">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">
        {isLogin ? t('login_title') : t('signup_title')}
      </h2>
      
      <form onSubmit={handleAuth} className="space-y-4">
        <Input 
          placeholder={t('username')}
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="glass-input text-white"
          autoFocus
        />
        <Input 
          type="password"
          placeholder={t('password')}
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="glass-input text-white"
        />
        <Button type="submit" isLoading={loading} className="w-full btn-primary">
          {isLogin ? t('login_btn') : t('signup_btn')}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="text-xs text-gray-400 hover:text-indigo-400 transition-colors"
        >
          {isLogin ? t('switch_signup') : t('switch_login')}
        </button>
      </div>
    </div>
  );
};