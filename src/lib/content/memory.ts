import type { SupabaseClient } from "@supabase/supabase-js";
export async function getRecentContentContext(
  client: SupabaseClient,
  brandId: string,
  limit = 30,
) {
  const [{ data, error }, { data: ideas }, { data: patterns }] =
    await Promise.all([
      client
        .from("posts")
        .select(
          "format,status,created_at,post_versions!posts_current_version_id_fkey(hook,cta,hashtags),content_pillars(name)",
        )
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false })
        .limit(limit),
      client
        .from("content_ideas")
        .select("topic,objective,hook,concept,recommended_format,created_at")
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false })
        .limit(limit),
      client
        .from("performance_patterns")
        .select(
          "dimension,dimension_value,sample_size,lift_percentage,confidence,summary",
        )
        .eq("brand_id", brandId)
        .gte("sample_size", 3)
        .order("lift_percentage", { ascending: false })
        .limit(8),
    ]);
  if (error) throw new Error(`Recent content lookup failed: ${error.message}`);
  return {
    recentPosts: (data ?? []).map((item) => ({
      format: item.format,
      status: item.status,
      createdAt: item.created_at,
      copy: item.post_versions,
      pillar: item.content_pillars,
    })),
    recentIdeas: ideas ?? [],
    performanceSignals: patterns ?? [],
  };
}

export async function getCreativeLearningContext(
  client: SupabaseClient,
  brandId: string,
  limit = 24,
) {
  const { data, error } = await client
    .from("creative_feedback")
    .select("outcome,reason,creative_snapshot,created_at")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Creative learning lookup failed: ${error.message}`);
  return {
    instruction: "Infer preferences from repeated signals. Use approved work as positive direction and rejected work as constraints. Never reproduce a prior layout, scene, person, pose, or composition.",
    approved: (data ?? []).filter((item) => item.outcome === "APPROVED").slice(0, 12),
    rejected: (data ?? []).filter((item) => item.outcome === "REJECTED").slice(0, 12),
  };
}
