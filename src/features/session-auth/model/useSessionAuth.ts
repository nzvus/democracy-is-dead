import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/shared/api/supabase';
import { User } from '@supabase/supabase-js';

export const useSessionAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // [FIX] Memoize client
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { user: existingUser } } = await supabase.auth.getUser();
      
      if (existingUser) {
        setUser(existingUser);
      } else {
        const { data: { user: anonUser }, error } = await supabase.auth.signInAnonymously();
        if (!error && anonUser) {
          setUser(anonUser);
        }
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]); // [FIX] Added dependency

  return { user, loading };
};