import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error("⚠️ ERRORE: Variabili Supabase non trovate!")
  }

  return createSupabaseClient(
    url || '', 
    key || ''
  )
}