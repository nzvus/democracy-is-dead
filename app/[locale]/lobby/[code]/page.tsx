import { notFound } from 'next/navigation';
import { createClient } from '@/shared/api/supabase'; // Ensure you have a server-safe client if needed, or use the standard one
import { LobbyPage } from '@/views/lobby/ui/LobbyPage';
import { createServerClient, CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Helper to create Server Client
const createServerSupabase = async () => {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
            // Note: This is read-only in Server Components, 
            // but required by the interface.
        },
      },
    }
  );
}

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createServerSupabase();

  // 1. Fetch Lobby ID by Code (Server Side Security)
  const { data: lobby } = await supabase
    .from('lobbies')
    .select('id')
    .eq('code', code.toUpperCase())
    .single();

  if (!lobby) {
    return notFound();
  }

  // 2. Render the FSD Page Widget
  return <LobbyPage lobbyId={lobby.id} />;
}