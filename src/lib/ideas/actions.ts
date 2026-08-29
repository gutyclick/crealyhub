"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { OpenAIProvider } from "@/lib/ai/client";
import { planContent } from "@/lib/ai/content-planner";
import { contentIdeaSchema } from "@/lib/ai/schemas";
import { buildBrandContext, type BrandRecord } from "@/lib/brand/context";
import { getRecentContentContext } from "@/lib/content/memory";
import { enqueueGeneration } from "@/lib/jobs/queue";
import { processGenerationQueueAfterResponse } from "@/lib/jobs/generation-worker";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { estimateTextCost, recordUsage } from "@/lib/usage/tracker";
export type ProposedIdea = z.infer<typeof contentIdeaSchema> & { id: string };
export type IdeaState = { ok: boolean; message: string; ideas: ProposedIdea[] };
export type ChooseIdeaState = { ok: boolean; message: string };
async function context() {
  const db = await createSupabaseServerClient();
  const { data: auth } = await db.auth.getUser();
  if (!auth.user) throw new Error("Tu sesión expiró.");
  const { data: brand } = await db
    .from("brands")
    .select("*")
    .eq("owner_user_id", auth.user.id)
    .limit(1)
    .maybeSingle();
  if (!brand) throw new Error("Completa Brand Memory antes de pedir ideas.");
  return { db, brand };
}
export async function proposeIdeas(previous: IdeaState): Promise<IdeaState> {
  try {
    const { db, brand: row } = await context();
    const brand = buildBrandContext(row as BrandRecord);
    const [{ data: assets }, { data: colors }, { data: fonts }, recent] =
      await Promise.all([
        db
          .from("brand_assets")
          .select("kind,label,notes")
          .eq("brand_id", row.id),
        db.from("brand_colors").select("role,name,hex").eq("brand_id", row.id),
        db.from("brand_fonts").select("role,name").eq("brand_id", row.id),
        getRecentContentContext(db, row.id),
      ]);
    brand.visualAssets = [
      ...(assets ?? []).map((item) => `${item.kind}: ${item.label}`),
      ...(colors ?? []).map((item) => `COLOR ${item.role}: ${item.hex}`),
      ...(fonts ?? []).map((item) => `FONT ${item.role}: ${item.name}`),
    ];
    const result = await planContent(
      new OpenAIProvider(),
      brand,
      recent,
      6,
      "Propón ideas nuevas sin que el usuario indique tema. Distribuye formatos y objetivos. Evita variaciones superficiales de conceptos recientes.",
    );
    await recordUsage(db, {
      brandId: row.id,
      provider: "openai",
      model: result.usage.model,
      operation: "idea_proposal",
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      cost: estimateTextCost(
        result.usage.inputTokens,
        result.usage.outputTokens,
      ),
    });
    const { data: inserted, error } = await db
      .from("content_ideas")
      .insert(
        result.data.ideas.map((idea) => ({
          brand_id: row.id,
          topic: idea.topic,
          objective: idea.objective,
          hook: idea.hook,
          concept: idea.concept,
          recommended_format: idea.format,
          visual_direction: idea.visualDirection,
          strategy_reason: idea.strategyReason,
          novelty_score: idea.noveltyScore,
          status: "IDEA",
        })),
      )
      .select(
        "id,topic,objective,hook,concept,recommended_format,visual_direction,strategy_reason,novelty_score",
      );
    if (error) throw error;
    const ideas = (inserted ?? []).map((item) =>
      contentIdeaSchema
        .extend({ id: z.uuid() })
        .parse({
          id: item.id,
          topic: item.topic,
          objective: item.objective,
          hook: item.hook,
          concept: item.concept,
          format: item.recommended_format,
          visualDirection: item.visual_direction,
          strategyReason: item.strategy_reason,
          noveltyScore: Number(item.novelty_score),
        }),
    );
    return {
      ok: true,
      message: `Añadí ${ideas.length} ideas nuevas. Puedes enviar todas las que quieras a la cola.`,
      ideas: [...previous.ideas, ...ideas],
    };
  } catch (cause) {
    return {
      ok: false,
      message:
        cause instanceof Error
          ? cause.message
          : "No pude proponer ideas ahora.",
      ideas: previous.ideas,
    };
  }
}
export async function chooseIdea(
  _previous: ChooseIdeaState,
  formData: FormData,
): Promise<ChooseIdeaState> {
  try {
    const ideaId = z.uuid().parse(formData.get("ideaId"));
    const { db, brand } = await context();
    const { data: idea, error: ideaError } = await db
      .from("content_ideas")
      .select("id,recommended_format")
      .eq("id", ideaId)
      .eq("brand_id", brand.id)
      .single();
    if (ideaError || !idea)
      throw new Error(ideaError?.message ?? "La idea ya no está disponible.");
    const { data: existing } = await db
      .from("posts")
      .select("id")
      .eq("idea_id", idea.id)
      .limit(1)
      .maybeSingle();
    if (existing) return { ok: true, message: "Esta idea ya está en la cola." };
    const { data: post, error } = await db
      .from("posts")
      .insert({
        brand_id: brand.id,
        idea_id: idea.id,
        format: idea.recommended_format,
        status: "IDEA",
      })
      .select("id")
      .single();
    if (error) throw error;
    await enqueueGeneration(db, {
      brandId: brand.id,
      postId: post.id,
      jobType: `GENERATE_${idea.recommended_format}` as
        "GENERATE_POST" | "GENERATE_STORY" | "GENERATE_CAROUSEL",
    });
    processGenerationQueueAfterResponse();
    revalidatePath("/create");
    revalidatePath("/overview");
    return {
      ok: true,
      message: "En cola. Puedes elegir otra idea de esta misma tanda.",
    };
  } catch (cause) {
    return {
      ok: false,
      message:
        cause instanceof Error
          ? cause.message
          : "No pude enviar esta idea a la cola.",
    };
  }
}
