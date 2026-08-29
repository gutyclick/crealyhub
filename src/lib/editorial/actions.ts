"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const id = z.string().uuid();
const text = z.string().trim().min(3).max(2000);
async function context(postId: string) {
  const client = await createSupabaseServerClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) throw new Error("Sesión expirada");
  const { data: post, error } = await client
    .from("posts")
    .select("id,brand_id,format,status,current_version_id,content_ideas(topic,visual_direction),post_versions!post_versions_post_id_fkey(*),media_assets!posts_cover_media_asset_id_fkey(id,bucket,object_key),carousels(carousel_slides(media_assets(id,bucket,object_key)))")
    .eq("id", id.parse(postId))
    .single();
  if (error) throw new Error(`No se pudo cargar el contenido: ${error.message}`);
  if (!post) throw new Error("Contenido no disponible");
  return { client, user: auth.user, post };
}
function creativeSnapshot(post: Awaited<ReturnType<typeof context>>["post"]) {
  const versions = (post.post_versions as Record<string, unknown>[]).sort(
    (a, b) => Number(b.version_number) - Number(a.version_number),
  );
  const version = versions.find((item) => item.id === post.current_version_id) ?? versions[0];
  const idea = Array.isArray(post.content_ideas) ? post.content_ideas[0] : post.content_ideas;
  return {
    format: post.format,
    topic: idea?.topic ?? "",
    ideaVisualDirection: idea?.visual_direction ?? "",
    hook: version?.hook ?? "",
    caption: version?.caption ?? "",
    visualDirection: version?.visual_direction ?? "",
  };
}
async function rememberDecision(
  contextValue: Awaited<ReturnType<typeof context>>,
  outcome: "APPROVED" | "REJECTED",
  reason = "",
) {
  const { client, user, post } = contextValue;
  await client.from("creative_feedback").insert({
    brand_id: post.brand_id,
    post_id: post.id,
    outcome,
    reason,
    creative_snapshot: creativeSnapshot(post),
    actor_user_id: user.id,
  }).throwOnError();
}
function refresh() {
  revalidatePath("/approvals");
  revalidatePath("/calendar");
  revalidatePath("/overview");
}
async function saveSchedule(
  client: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  postId: string,
  at: Date,
) {
  const values = {
    scheduled_at: at.toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    active: true,
  };
  const { data: existing } = await client
    .from("schedules")
    .select("id,revision")
    .eq("post_id", postId)
    .eq("active", true)
    .maybeSingle();
  if (existing)
    await client
      .from("schedules")
      .update({ ...values, revision: existing.revision + 1 })
      .eq("id", existing.id)
      .throwOnError();
  else
    await client
      .from("schedules")
      .insert({ post_id: postId, ...values })
      .throwOnError();
}
export async function approvePost(postId: string, formData: FormData) {
  const contextValue = await context(postId);
  const { client } = contextValue;
  const raw = String(formData.get("scheduledAt") ?? "");
  let at: Date | null = null;
  if (raw) {
    at = new Date(raw);
    if (Number.isNaN(at.valueOf()) || at <= new Date())
      throw new Error("Elige una fecha futura");
  }
  await client
    .rpc("apply_editorial_transition", {
      target_post_id: postId,
      next_status: at ? "SCHEDULED" : "APPROVED",
      event_note: at ? "Aprobado y programado" : "Aprobado",
    })
    .throwOnError();
  if (at) {
    await saveSchedule(client, postId, at);
    await client
      .from("posts")
      .update({ scheduled_at: at.toISOString() })
      .eq("id", postId)
      .throwOnError();
  }
  await rememberDecision(contextValue, "APPROVED", "Aprobado por el usuario");
  refresh();
}
export async function rejectPost(postId: string) {
  const { client } = await context(postId);
  await client
    .rpc("apply_editorial_transition", {
      target_post_id: postId,
      next_status: "REJECTED",
      event_note: "Rechazado en revisión",
    })
    .throwOnError();
  refresh();
}
export async function rejectAndDeletePost(postId: string, formData: FormData) {
  const contextValue = await context(postId);
  const { client, post } = contextValue;
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 1000);
  await rememberDecision(contextValue, "REJECTED", reason || "No encaja con la marca");

  const cover = Array.isArray(post.media_assets) ? post.media_assets[0] : post.media_assets;
  const carousel = Array.isArray(post.carousels) ? post.carousels[0] : post.carousels;
  const slideMedia = (carousel?.carousel_slides ?? []).flatMap((slide) => {
    const item = Array.isArray(slide.media_assets) ? slide.media_assets[0] : slide.media_assets;
    return item ? [item] : [];
  });
  const media = [cover, ...slideMedia].filter(
    (item): item is { id: string; bucket: string; object_key: string } => Boolean(item),
  );
  const uniqueMedia = [...new Map(media.map((item) => [item.id, item])).values()];

  for (const item of uniqueMedia) {
    const { error } = await client.storage.from(item.bucket).remove([item.object_key]);
    if (error) throw new Error(`No se pudo borrar un archivo: ${error.message}`);
  }
  await client.from("posts").delete().eq("id", postId).throwOnError();
  if (uniqueMedia.length) {
    await client
      .from("media_assets")
      .delete()
      .in("id", uniqueMedia.map((item) => item.id))
      .throwOnError();
  }
  refresh();
}

export async function requestChanges(postId: string, formData: FormData) {
  const feedback = text.parse(formData.get("feedback"));
  const { client, user, post } = await context(postId);
  const versions = (post.post_versions as Record<string, unknown>[]).sort(
    (a, b) => Number(b.version_number) - Number(a.version_number),
  );
  const source =
    versions.find((v) => v.id === post.current_version_id) ?? versions[0];
  if (!source) throw new Error("No existe una versión para revisar");
  const next = Number(versions[0]?.version_number ?? 0) + 1;
  const { data: version, error } = await client
    .from("post_versions")
    .insert({
      post_id: postId,
      version_number: next,
      hook: source.hook,
      caption: source.caption,
      cta: source.cta,
      alt_text: source.alt_text,
      hashtags: source.hashtags,
      visual_direction: source.visual_direction,
      source_version_id: source.id,
      change_reason: feedback,
      created_by_kind: "USER",
    })
    .select("id")
    .single();
  if (error) throw error;
  await client
    .from("revision_requests")
    .insert({
      post_id: postId,
      source_version_id: source.id,
      result_version_id: version.id,
      feedback,
      status: "RESOLVED",
      created_by: user.id,
      resolved_at: new Date().toISOString(),
    })
    .throwOnError();
  await client
    .from("posts")
    .update({ current_version_id: version.id })
    .eq("id", postId)
    .throwOnError();
  await client
    .rpc("apply_editorial_transition", {
      target_post_id: postId,
      next_status: "NEEDS_CHANGES",
      event_note: feedback,
    })
    .throwOnError();
  refresh();
}
export async function editPostCopy(postId: string, formData: FormData) {
  const hook = text.parse(formData.get("hook"));
  const caption = text.parse(formData.get("caption"));
  const { client, post } = await context(postId);
  const versions = (post.post_versions as Record<string, unknown>[]).sort(
    (a, b) => Number(b.version_number) - Number(a.version_number),
  );
  const source =
    versions.find((v) => v.id === post.current_version_id) ?? versions[0];
  const { data, error } = await client
    .from("post_versions")
    .insert({
      post_id: postId,
      version_number: Number(versions[0]?.version_number ?? 0) + 1,
      hook,
      caption,
      cta: source.cta,
      alt_text: source.alt_text,
      hashtags: source.hashtags,
      visual_direction: source.visual_direction,
      source_version_id: source.id,
      change_reason: "Edición editorial manual",
      created_by_kind: "USER",
    })
    .select("id")
    .single();
  if (error) throw error;
  await client
    .from("posts")
    .update({ current_version_id: data.id })
    .eq("id", postId)
    .throwOnError();
  refresh();
}
export async function moveSchedule(postId: string, iso: string) {
  const at = new Date(iso);
  if (Number.isNaN(at.valueOf()) || at <= new Date())
    throw new Error("La fecha debe ser futura");
  const { client, post } = await context(postId);
  if (!["APPROVED", "SCHEDULED"].includes(post.status))
    throw new Error("Solo se programa contenido aprobado");
  await saveSchedule(client, postId, at);
  await client
    .from("posts")
    .update({ scheduled_at: at.toISOString() })
    .eq("id", postId)
    .throwOnError();
  if (post.status === "APPROVED")
    await client
      .rpc("apply_editorial_transition", {
        target_post_id: postId,
        next_status: "SCHEDULED",
        event_note: "Programado desde calendario",
      })
      .throwOnError();
  refresh();
}
