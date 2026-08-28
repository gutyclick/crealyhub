import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CalendarPost, EditorialPost } from "@/lib/editorial/types";

async function signed(
  client: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  asset: unknown,
) {
  const row = (Array.isArray(asset) ? asset[0] : asset) as {
    bucket?: string;
    object_key?: string;
  } | null;
  if (!row?.bucket || !row.object_key) return null;
  const { data } = await client.storage
    .from(row.bucket)
    .createSignedUrl(row.object_key, 3600);
  return data?.signedUrl ?? null;
}

export async function getApprovalQueue(): Promise<EditorialPost[]> {
  const client = await createSupabaseServerClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await client
    .from("posts")
    .select(
      "id,format,status,scheduled_at,current_version_id,content_ideas(topic),content_pillars(name),media_assets!posts_cover_media_asset_id_fkey(bucket,object_key),post_versions!post_versions_post_id_fkey(id,version_number,hook,caption,cta,hashtags,created_at),carousels(id,carousel_slides(id,position,role,headline,body,media_assets(bucket,object_key)))",
    )
    .in("status", ["PENDING_APPROVAL", "NEEDS_CHANGES"])
    .order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudo cargar la cola de aprobación: ${error.message}`);
  return Promise.all(
    (data ?? []).map(async (p) => {
      const versions = (p.post_versions ?? []).sort(
        (a, b) => b.version_number - a.version_number,
      );
      const current =
        versions.find((v) => v.id === p.current_version_id) ?? versions[0];
      if (!current) throw new Error(`La publicación ${p.id} no tiene una versión para revisar.`);
      const carousel = Array.isArray(p.carousels)
        ? p.carousels[0]
        : p.carousels;
      const slides = await Promise.all(
        (carousel?.carousel_slides ?? [])
          .sort((a, b) => a.position - b.position)
          .map(async (s) => ({
            id: s.id,
            position: s.position,
            role: s.role,
            headline: s.headline,
            body: s.body,
            mediaUrl: await signed(client, s.media_assets),
          })),
      );
      return {
        id: p.id,
        format: p.format,
        status: p.status,
        scheduledAt: p.scheduled_at,
        topic:
          (Array.isArray(p.content_ideas)
            ? p.content_ideas[0]
            : p.content_ideas
          )?.topic ?? "Contenido sin título",
        pillar:
          (Array.isArray(p.content_pillars)
            ? p.content_pillars[0]
            : p.content_pillars
          )?.name ?? null,
        coverUrl: await signed(client, p.media_assets),
        version: {
          id: current.id,
          number: current.version_number,
          hook: current.hook,
          caption: current.caption,
          cta: current.cta,
          hashtags: current.hashtags,
          createdAt: current.created_at,
        },
        slides,
        versions: versions.length,
      };
    }),
  );
}

export async function getCalendarPosts(
  start: Date,
  end: Date,
): Promise<CalendarPost[]> {
  const client = await createSupabaseServerClient();
  const { data } = await client
    .from("posts")
    .select(
      "id,format,status,scheduled_at,content_ideas(topic),media_assets!posts_cover_media_asset_id_fkey(bucket,object_key)",
    )
    .not("scheduled_at", "is", null)
    .gte("scheduled_at", start.toISOString())
    .lt("scheduled_at", end.toISOString())
    .order("scheduled_at");
  return Promise.all(
    (data ?? []).map(async (p) => ({
      id: p.id,
      format: p.format,
      status: p.status,
      scheduledAt: p.scheduled_at!,
      topic:
        (Array.isArray(p.content_ideas) ? p.content_ideas[0] : p.content_ideas)
          ?.topic ?? "Sin título",
      coverUrl: await signed(client, p.media_assets),
    })),
  );
}
