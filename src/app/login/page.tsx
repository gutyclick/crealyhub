import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { signIn } from "@/lib/auth/actions";
import { hasSupabaseEnv } from "@/lib/env";

export const metadata: Metadata = { title: "Entrar" };
export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const error = (await searchParams).error;
  return <main className="grid min-h-screen place-items-center p-6"><div className="w-full max-w-md">
    <div className="mb-8 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[var(--ink)] text-white"><Sparkles size={19}/></span><div><p className="font-bold">CrealyHub</p><p className="text-xs text-[var(--muted)]">Mesa editorial personal</p></div></div>
    <section className="card p-7 sm:p-9"><p className="eyebrow">Acceso privado</p><h1 className="editorial-title mt-3 text-4xl font-medium">Tu comunidad te espera.</h1><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Entra para revisar lo que tu Community Manager ha preparado.</p>
      {!hasSupabaseEnv?<p className="mt-5 rounded-xl bg-[var(--violet-soft)] p-4 text-sm">Modo de demostración activo. Configura <code>.env.local</code> para habilitar el acceso.</p>:null}
      {typeof error==="string"?<p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>:null}
      <form action={signIn} className="mt-7 grid gap-4"><label className="field-label">Email<input className="field" type="email" name="email" autoComplete="email" required/></label><label className="field-label">Contraseña<input className="field" type="password" name="password" autoComplete="current-password" required/></label><button className="button-primary mt-2" disabled={!hasSupabaseEnv}>Entrar</button></form>
    </section>
  </div></main>;
}
