import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

// Singleton pattern para evitar múltiplas instâncias do cliente
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const createClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>()
  }
  return supabaseClient
}
