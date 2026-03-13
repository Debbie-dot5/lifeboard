import { createClient, SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | null = null

/**
 * Returns a singleton Supabase client.
 * Pass env vars explicitly so this works in both Next.js and Expo.
 *
 * Web (Next.js):   createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
 * Mobile (Expo):   createSupabaseClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!)
 */
const createSupabaseClient = (url: string, anonKey: string): SupabaseClient => {
  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }
  return client
}

export { createSupabaseClient }
export type { SupabaseClient }
