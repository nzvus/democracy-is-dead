import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/shared/api/supabase';
import { User } from '@supabase/supabase-js';

export const useSessionAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const initAuth = async () => {
      // 1. Get the session from the browser
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // 2. VERIFY the user actually exists in the DB
        const { data: { user: dbUser }, error } = await supabase.auth.getUser();
        
        if (error || !dbUser) {
          // 🚨 User was deleted from DB but session remains -> Force Logout
          console.warn("Session invalid, forcing logout...");
          await supabase.auth.signOut();
          setUser(null);
        } else {
          setUser(dbUser);
        }
      } else {
        // No session, try anon or stay null
        // (Optional: Auto-create anon user here if desired, otherwise leave null)
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (session?.user) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return { user, loading };
};