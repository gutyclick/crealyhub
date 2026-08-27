import { CreateBrief } from "@/components/content/create-brief";
import { BatchGenerator } from "@/components/content/batch-generator";
import { hasSupabaseEnv } from "@/lib/env";
export default function Page(){return <div className="mx-auto max-w-5xl"><header className="mb-8"><p className="eyebrow">Nuevo brief</p><h1 className="editorial-title mt-2 text-5xl font-medium">¿Qué vamos a contar hoy?</h1><p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">Dame una dirección o déjalo en mis manos. Primero decidiré la narrativa; después crearé la pieza.</p></header>{hasSupabaseEnv&&<BatchGenerator/>}<CreateBrief enabled={hasSupabaseEnv}/></div>}
