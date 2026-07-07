import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only ever use the ANON key on the frontend. Never the service_role key.
export const supabaseConfigMissing = !supabaseUrl || !supabaseAnonKey
export const supabase = supabaseConfigMissing
  ? null
  : createClient(supabaseUrl, supabaseAnonKey)
