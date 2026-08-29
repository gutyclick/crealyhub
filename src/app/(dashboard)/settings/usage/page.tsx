import {
  Activity,
  Clock3,
  DollarSign,
  ImageIcon,
  Layers3,
  Type,
} from "lucide-react";
import { getUsageDashboard } from "@/lib/usage/data";
import { hasSupabaseEnv } from "@/lib/env";
export default async function Page() {
  if (!hasSupabaseEnv)
    return (
      <div className="card p-8">
        Configura Supabase para activar el control de uso.
      </div>
    );
  const data = await getUsageDashboard();
  if (!data)
    return (
      <div className="card p-8">
        Completa Brand Memory para activar el control de uso.
      </div>
    );
  const metrics = [
    {
      label: "Coste AI este mes",
      value: `$${data.cost.toFixed(2)}`,
      note: "informativo",
      icon: DollarSign,
    },
    {
      label: "Imágenes hoy",
      value: String(data.todayImages),
      note: "sin límite",
      icon: ImageIcon,
    },
    {
      label: "Generaciones de texto",
      value: String(data.textGenerations),
      note: "este mes",
      icon: Type,
    },
    {
      label: "En cola",
      value: String(data.queued),
      note: "jobs pendientes",
      icon: Clock3,
    },
  ];
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <p className="eyebrow">Uso y automatización</p>
        <h1 className="editorial-title mt-2 text-5xl font-medium">
          Consumo transparente.
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
          Aquí puedes vigilar el consumo de IA. La aplicación no limita tus
          generaciones.
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => (
          <article className="card p-5" key={item.label}>
            <item.icon size={20} className="text-[var(--violet)]" />
            <p className="mt-6 text-sm font-bold text-[var(--muted)]">
              {item.label}
            </p>
            <p className="mt-1 text-3xl font-black">{item.value}</p>
            <p className="text-xs text-[var(--muted)]">{item.note}</p>
          </article>
        ))}
      </section>
      <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <article className="card p-6">
          <div className="flex items-center gap-3">
            <Layers3 className="text-[var(--violet)]" />
            <div>
              <h2 className="text-xl font-black">Content buffer</h2>
              <p className="text-sm text-[var(--muted)]">
                Objetivo: {data.limits.bufferDays} días ×{" "}
                {data.limits.targetPerDay} piezas
              </p>
            </div>
          </div>
          <p className="mt-8 text-6xl font-black">{data.buffered}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            piezas futuras preparadas o en proceso
          </p>
        </article>
        <article className="card p-6">
          <div className="flex items-center gap-3">
            <Activity className="text-[var(--violet)]" />
            <h2 className="text-xl font-black">Últimas automatizaciones</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {data.runs.length ? (
              data.runs.map((run) => (
                <div className="rounded-xl bg-black/[.035] p-3" key={run.id}>
                  <div className="flex justify-between gap-3">
                    <p className="text-sm font-bold">{run.summary}</p>
                    <span className="text-[10px] font-black text-[var(--violet)]">
                      {run.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {new Date(run.started_at).toLocaleString("es-PA")}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">
                Aún no hay ejecuciones.
              </p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
