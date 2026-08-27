import { createClient } from "@supabase/supabase-js";
import { env,supabaseSecretKey } from "@/lib/env";
export function createSupabaseAdminClient(){if(!env.NEXT_PUBLIC_SUPABASE_URL||!supabaseSecretKey)throw new Error("Supabase service environment is missing.");return createClient(env.NEXT_PUBLIC_SUPABASE_URL,supabaseSecretKey,{auth:{persistSession:false,autoRefreshToken:false}})}
