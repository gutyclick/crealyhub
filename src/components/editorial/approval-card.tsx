"use client";
import { useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  History,
  Maximize2,
  PenLine,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import {
  approvePost,
  editPostCopy,
  rejectAndDeletePost,
  requestChanges,
} from "@/lib/editorial/actions";
import type { EditorialPost } from "@/lib/editorial/types";
export function ApprovalCard({ post }: { post: EditorialPost }) {
  const [slide, setSlide] = useState(0);
  const [preview, setPreview] = useState(false);
  const [panel, setPanel] = useState<"copy" | "feedback" | "reject" | null>(null);
  const current = post.slides[slide];
  const image = current?.mediaUrl ?? post.coverUrl;
  return (
    <article className="card overflow-hidden">
      <div className="grid lg:grid-cols-[minmax(280px,.82fr)_1.18fr]">
        <div className="relative min-h-[420px] bg-[#171b26]">
          {image ? (
            <button type="button" onClick={()=>setPreview(true)} className="absolute inset-0 size-full cursor-zoom-in" aria-label="Ver diseño completo"><img src={image} alt={current?.headline ?? post.version.hook} className="size-full object-contain"/><span className="absolute bottom-4 right-4 grid size-10 place-items-center rounded-full bg-black/65 text-white backdrop-blur"><Maximize2 size={17}/></span></button>
          ) : (
            <div className="absolute inset-0 grid place-items-center text-sm font-semibold text-[var(--muted)]">
              Vista previa no disponible
            </div>
          )}
          <div className="absolute left-4 top-4 flex gap-2">
            <Badge>{post.format}</Badge>
            <Badge>
              {post.status === "NEEDS_CHANGES" ? "Cambios" : "Revisión"}
            </Badge>
          </div>
          {post.slides.length > 1 && (
            <>
              <button
                aria-label="Slide anterior"
                onClick={() =>
                  setSlide(
                    (v) => (v - 1 + post.slides.length) % post.slides.length,
                  )
                }
                className="preview-arrow left-3"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                aria-label="Slide siguiente"
                onClick={() => setSlide((v) => (v + 1) % post.slides.length)}
                className="preview-arrow right-3"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
          {post.slides.length>1&&<div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">{post.slides.map((item,index)=><button key={item.id} onClick={()=>setSlide(index)} aria-label={`Ver slide ${index+1}`} className={`h-1.5 rounded-full transition-all ${index===slide?"w-7 bg-white":"w-2 bg-white/45"}`}/>)}</div>}
        </div>
        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">{post.pillar ?? "Editorial queue"}</p>
              <h2 className="editorial-title mt-2 text-3xl font-semibold">
                {post.topic}
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)]">
              <History size={14} />V{post.version.number} · {post.versions}
            </span>
          </div>
          {current && (
            <div className="mt-5 rounded-2xl bg-[var(--paper)] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--violet)]">
                Slide {slide + 1} · {current.role}
              </p>
              <p className="mt-2 font-bold">{current.headline}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                {current.body}
              </p>
            </div>
          )}
          <p className="mt-6 text-lg font-bold">{post.version.hook}</p>
          <p className="mt-3 line-clamp-5 text-sm leading-6 text-[var(--muted)]">
            {post.version.caption}
          </p>
          <div className="mt-auto grid gap-3 pt-7 sm:grid-cols-2">
            <form
              action={approvePost.bind(null, post.id)}
              className="flex gap-2"
            >
              <input
                className="field min-w-0"
                type="datetime-local"
                name="scheduledAt"
                aria-label="Programar opcionalmente"
              />
              <button className="button-primary shrink-0">
                <Check size={17} />
                Aprobar
              </button>
            </form>
            <div className="flex gap-2">
              <button
                onClick={() => setPanel(panel === "copy" ? null : "copy")}
                className="button-secondary flex-1"
              >
                <PenLine size={16} />
                Editar
              </button>
              <button
                onClick={() =>
                  setPanel(panel === "feedback" ? null : "feedback")
                }
                className="button-secondary flex-1"
              >
                <RotateCcw size={16} />
                Cambios
              </button>
              <button
                type="button"
                onClick={() => setPanel(panel === "reject" ? null : "reject")}
                className="button-secondary px-3 text-red-600"
                aria-label="Rechazar y borrar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          {panel === "copy" && (
            <form
              action={editPostCopy.bind(null, post.id)}
              className="mt-4 grid gap-3 border-t border-[var(--line)] pt-4"
            >
              <input
                name="hook"
                className="field"
                defaultValue={post.version.hook}
                required
                minLength={3}
              />
              <textarea
                name="caption"
                className="field min-h-28"
                defaultValue={post.version.caption}
                required
                minLength={3}
              />
              <button className="button-primary justify-self-start">
                Guardar como V{post.version.number + 1}
              </button>
            </form>
          )}
          {panel === "feedback" && (
            <form
              action={requestChanges.bind(null, post.id)}
              className="mt-4 grid gap-3 border-t border-[var(--line)] pt-4"
            >
              <textarea
                name="feedback"
                className="field min-h-24"
                placeholder="Haz el hook más directo…"
                required
                minLength={3}
              />
              <button className="button-primary justify-self-start">
                Crear nueva versión
              </button>
            </form>
          )}
          {panel === "reject" && (
            <form
              action={rejectAndDeletePost.bind(null, post.id)}
              onSubmit={(event) => {
                if (!window.confirm("Se borrará el post y sus imágenes. La decisión se conservará para que la IA aprenda. ¿Continuar?")) event.preventDefault();
              }}
              className="mt-4 grid gap-3 border-t border-red-200 pt-4"
            >
              <textarea
                name="reason"
                className="field min-h-20"
                placeholder="¿Qué no te gustó? Esto ayuda a mejorar los próximos diseños."
                maxLength={1000}
              />
              <button className="button-secondary justify-self-start border-red-200 text-red-700">
                <Trash2 size={16} /> Rechazar y borrar definitivamente
              </button>
            </form>
          )}
        </div>
      </div>
      {preview&&image&&<div className="fixed inset-0 z-50 grid bg-[#080b13]/95 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="Vista completa" onClick={()=>setPreview(false)}><button onClick={()=>setPreview(false)} className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full bg-white text-[var(--ink)]" aria-label="Cerrar"><X size={20}/></button><div className="relative mx-auto h-full w-full max-w-6xl overflow-hidden rounded-2xl bg-black" onClick={event=>event.stopPropagation()}><img src={image} alt={current?.headline??post.version.hook} className="size-full object-contain"/>{post.slides.length>1&&<><button onClick={()=>setSlide(v=>(v-1+post.slides.length)%post.slides.length)} className="preview-arrow left-4" aria-label="Slide anterior"><ChevronLeft/></button><button onClick={()=>setSlide(v=>(v+1)%post.slides.length)} className="preview-arrow right-4" aria-label="Slide siguiente"><ChevronRight/></button><div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">{post.slides.map((item,index)=><button key={item.id} onClick={()=>setSlide(index)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${index===slide?"bg-white text-black":"bg-black/60 text-white"}`}>{index+1}</button>)}</div></>}</div></div>}
    </article>
  );
}
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[var(--ink)]/80 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white">
      {children}
    </span>
  );
}
