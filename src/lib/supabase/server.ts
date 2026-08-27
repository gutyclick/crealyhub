import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env, supabasePublicKey } from "@/lib/env";

export async function createSupabaseServerClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !supabasePublicKey) {
    throw new Error("Supabase is not configured. Copy .env.example to .env.local.");
  }

  const cookieStore = await cookies();
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    supabasePublicKey,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot write cookies. Proxy refreshes the session.
          }
        },
      },
    },
  );
}
