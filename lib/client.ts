import { createBrowserClient } from '@supabase/ssr'

// Variable to hold the single instance
let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  // 1. Check if we already have a client. If yes, return it.
  if (client) return client

  // 2. If not, create a new one
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables")
  }

  client = createBrowserClient(url, key)

  // 3. Return the new client
  return client
}