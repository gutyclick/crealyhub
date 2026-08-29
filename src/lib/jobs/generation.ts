import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { OpenAIProvider } from "@/lib/ai/client";
import {
  OpenAIImageProvider,
  type ImageFormat,
} from "@/lib/ai/image-generator";
import { planContent } from "@/lib/ai/content-planner";
import { writeCopy } from "@/lib/ai/copywriter";
import { planCarousel } from "@/lib/ai/carousel-planner";
import { buildVisualPrompt } from "@/lib/ai/strategy";
import { buildBrandContext, type BrandRecord } from "@/lib/brand/context";
import { getCreativeLearningContext, getRecentContentContext } from "@/lib/content/memory";
import { SupabaseStorageProvider } from "@/lib/storage/supabase-provider";
import { finalizeImage } from "@/lib/storage/image-pipeline";
import { assertGenerationAllowed } from "@/lib/usage/limits";
import {
  estimateImageCost,
  estimateTextCost,
  recordUsage,
} from "@/lib/usage/tracker";
import { log } from "@/lib/observability/logger";

type Job = {
  id: string;
  brand_id: string;
  post_id: string;
  attempt_count: number;
  max_attempts: number;
  input_snapshot?: {
    revisionId?: string;
    sourceVersionId?: string;
    feedback?: string;
  };
};
export async function processGenerationJob(client: SupabaseClient, job: Job) {
  log("info", "Generation job started", { jobId: job.id, postId: job.post_id });
  const { data: post, error } = await client
    .from("posts")
    .select("id,brand_id,format,content_ideas(*),brands(*)")
    .eq("id", job.post_id)
    .single();
  if (error || !post)
    throw new Error(`Post context unavailable: ${error?.message}`);
  const rawBrand = Array.isArray(post.brands) ? post.brands[0] : post.brands;
  const rawIdea = Array.isArray(post.content_ideas)
    ? post.content_ideas[0]
    : post.content_ideas;
  const brandRow = rawBrand as unknown as BrandRecord & {
    owner_user_id: string;
  };
  const brand = buildBrandContext(brandRow);
  const [{ data: visualAssets }, { data: colors }, { data: fonts }] =
    await Promise.all([
      client
        .from("brand_assets")
        .select("kind,label,notes,media_assets(bucket,object_key,mime_type)")
        .eq("brand_id", post.brand_id)
        .order("sort_order")
        .limit(20),
      client
        .from("brand_colors")
        .select("name,hex,role")
        .eq("brand_id", post.brand_id)
        .order("sort_order"),
      client
        .from("brand_fonts")
        .select("name,role")
        .eq("brand_id", post.brand_id),
    ]);
  brand.visualAssets = [
    ...(visualAssets ?? []).map(
      (asset) =>
        `${asset.kind}: ${asset.label}${asset.notes ? ` — ${asset.notes}` : ""}`,
    ),
    ...(colors ?? []).map(
      (color) => `COLOR ${color.role}: ${color.name} ${color.hex}`,
    ),
    ...(fonts ?? []).map((font) => `FONT ${font.role}: ${font.name}`),
  ];
  const assetRows = (visualAssets ?? []) as Array<{
    kind: string;
    media_assets:
      | { bucket: string; object_key: string }
      | Array<{ bucket: string; object_key: string }>
      | null;
  }>;
  const downloadBrandAsset = async (asset: (typeof assetRows)[number] | undefined) => {
    const relation = asset?.media_assets;
    const media = Array.isArray(relation) ? relation[0] : relation;
    if (!media) return undefined;
    const { data, error: downloadError } = await client.storage
      .from(media.bucket)
      .download(media.object_key);
    if (downloadError || !data) {
      log("warn", "Brand asset could not be downloaded", {
        kind: asset?.kind,
        error: downloadError?.message,
      });
      return undefined;
    }
    return Buffer.from(await data.arrayBuffer());
  };
  const referenceAssets = assetRows
    .filter((asset) => asset.kind === "VISUAL_REFERENCE")
    .slice(0, 4);
  if (!referenceAssets.length) {
    const product = assetRows.find((asset) => asset.kind === "PRODUCT");
    if (product) referenceAssets.push(product);
  }
  const logoAsset = assetRows.find((asset) => asset.kind === "LOGO");
  const [referenceDownloads, logoImage] = await Promise.all([
    Promise.all(referenceAssets.map(downloadBrandAsset)),
    downloadBrandAsset(logoAsset),
  ]);
  const referenceImages = referenceDownloads.flatMap((image) =>
    image ? [image] : [],
  );
  const creativeLearning = await getCreativeLearningContext(client, post.brand_id);
  const recentContent = await getRecentContentContext(client, post.brand_id);
  const revision = job.input_snapshot;
  let idea = rawIdea as unknown as Record<string, unknown>;
  const ai = new OpenAIProvider();
  if (idea.topic === "AUTO") {
    const planned = await planContent(
      ai,
      brand,
      recentContent,
      1,
      String(idea.concept ?? ""),
    );
    idea = { ...idea, ...planned.data.ideas[0] };
    await client
      .from("content_ideas")
      .update({
        topic: idea.topic,
        objective: idea.objective,
        hook: idea.hook,
        concept: idea.concept,
        visual_direction: idea.visualDirection,
        strategy_reason: idea.strategyReason,
        novelty_score: idea.noveltyScore,
        recommended_format: idea.format,
      })
      .eq("id", String(idea.id));
    await recordUsage(client, {
      brandId: post.brand_id,
      postId: post.id,
      provider: "openai",
      model: planned.usage.model,
      operation: "content_plan",
      inputTokens: planned.usage.inputTokens,
      outputTokens: planned.usage.outputTokens,
      cost: estimateTextCost(
        planned.usage.inputTokens,
        planned.usage.outputTokens,
      ),
    });
  }
  const isCarousel = post.format === "CAROUSEL";
  const revisionContext = revision?.feedback
    ? {
        ...idea,
        revisionFeedback: revision.feedback,
        revisionInstruction:
          "Produce una revisión claramente distinta que atienda cada cambio solicitado y conserve el objetivo central del post.",
      }
    : idea;
  const carousel = isCarousel
    ? await planCarousel(ai, brand, revisionContext)
    : null;
  const copy = await writeCopy(ai, brand, revisionContext, recentContent);
  await recordUsage(client, {
    brandId: post.brand_id,
    postId: post.id,
    provider: "openai",
    model: copy.usage.model,
    operation: "copy",
    inputTokens: copy.usage.inputTokens,
    outputTokens: copy.usage.outputTokens,
    cost: estimateTextCost(copy.usage.inputTokens, copy.usage.outputTokens),
  });
  if (carousel)
    await recordUsage(client, {
      brandId: post.brand_id,
      postId: post.id,
      provider: "openai",
      model: carousel.usage.model,
      operation: "carousel_plan",
      inputTokens: carousel.usage.inputTokens,
      outputTokens: carousel.usage.outputTokens,
      cost: estimateTextCost(
        carousel.usage.inputTokens,
        carousel.usage.outputTokens,
      ),
    });
  const imageCount = carousel?.data.slides.length ?? 1;
  await assertGenerationAllowed(client, post.brand_id, imageCount);
  const { data: latestVersion } = await client
    .from("post_versions")
    .select("version_number")
    .eq("post_id", post.id)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { data: version, error: versionError } = await client
    .from("post_versions")
    .insert({
      post_id: post.id,
      version_number: Number(latestVersion?.version_number ?? 0) + 1,
      hook: copy.data.hook,
      caption: copy.data.caption,
      cta: copy.data.cta,
      alt_text: copy.data.altText,
      hashtags: copy.data.hashtags,
      visual_direction: String(
        idea.visualDirection ?? idea.visual_direction ?? "",
      ),
      source_version_id: revision?.sourceVersionId ?? null,
      change_reason: revision?.feedback ?? null,
      created_by_kind: "AI",
    })
    .select("id")
    .single();
  if (versionError)
    throw new Error(`Version insert failed: ${versionError.message}`);
  await client
    .from("posts")
    .update({ current_version_id: version.id, status: "GENERATING" })
    .eq("id", post.id);
  let carouselId: string | undefined;
  if (carousel) {
    const { data: existingCarousel } = await client
      .from("carousels")
      .select("id")
      .eq("post_id", post.id)
      .maybeSingle();
    const carouselValues = {
      topic: carousel.data.topic,
      objective: carousel.data.objective,
      hook: carousel.data.hook,
      cta: carousel.data.cta,
      visual_direction: carousel.data.visualDirection,
      slide_count: carousel.data.slides.length,
    };
    const carouselQuery = existingCarousel
      ? client.from("carousels").update(carouselValues).eq("id", existingCarousel.id)
      : client.from("carousels").insert({ post_id: post.id, ...carouselValues });
    const { data: c, error: cError } = await carouselQuery
      .select("id")
      .single();
    if (cError) throw new Error(`Carousel save failed: ${cError.message}`);
    carouselId = c.id;
    if (existingCarousel)
      await client
        .from("carousel_slides")
        .delete()
        .eq("carousel_id", c.id)
        .throwOnError();
    await client
      .from("carousel_slides")
      .insert(
        carousel.data.slides.map((slide) => ({
          carousel_id: c.id,
          position: slide.position,
          role: slide.role,
          headline: slide.headline,
          body: slide.body,
          visual_instruction: slide.visualInstruction,
        })),
      );
  }
  const imageProvider = new OpenAIImageProvider();
  const storage = new SupabaseStorageProvider(client);
  const units = carousel?.data.slides ?? [
    {
      position: 1,
      headline: copy.data.hook,
      body: "",
      visualInstruction: String(idea.visualDirection ?? ""),
    },
  ];
  let coverId: string | undefined;
  for (const unit of units) {
    const visual = await buildVisualPrompt(
      ai,
      brand,
      {
        idea,
        carousel: carousel?.data,
        slide: unit,
        creativeLearning,
        revisionFeedback: revision?.feedback,
      },
      post.format,
    );
    await recordUsage(client, {
      brandId: post.brand_id,
      postId: post.id,
      provider: "openai",
      model: visual.usage.model,
      operation: "visual_prompt",
      inputTokens: visual.usage.inputTokens,
      outputTokens: visual.usage.outputTokens,
      cost: estimateTextCost(
        visual.usage.inputTokens,
        visual.usage.outputTokens,
      ),
    });
    const generated = referenceImages.length
      ? await imageProvider.edit(
          referenceImages,
          visual.data,
          post.format as ImageFormat,
        )
      : await imageProvider.generate(visual.data, post.format as ImageFormat);
    const key = `${brandRow.owner_user_id}/${post.brand_id}/${post.id}/${String(unit.position).padStart(2, "0")}-${randomUUID()}.jpg`;
    const final = await finalizeImage(
      storage,
      generated.bytes,
      post.format as ImageFormat,
      key,
      logoImage,
      {
        placement: visual.data.logoPlacement,
        scale: visual.data.logoScale,
      },
    );
    const { data: asset, error: assetError } = await client
      .from("media_assets")
      .insert({
        brand_id: post.brand_id,
        kind: "FINAL",
        storage_provider: "supabase",
        bucket: final.bucket,
        object_key: final.key,
        mime_type: final.mimeType,
        width: final.width,
        height: final.height,
        bytes: final.bytes,
        checksum_sha256: final.checksum,
        is_final: true,
      })
      .select("id")
      .single();
    if (assetError)
      throw new Error(`Asset insert failed: ${assetError.message}`);
    coverId ??= asset.id;
    if (carouselId)
      await client
        .from("carousel_slides")
        .update({ media_asset_id: asset.id })
        .eq("carousel_id", carouselId)
        .eq("position", unit.position);
    await recordUsage(client, {
      brandId: post.brand_id,
      postId: post.id,
      provider: "openai",
      model: generated.model,
      operation: "image_generation",
      inputTokens: generated.inputTokens,
      outputTokens: generated.outputTokens,
      images: 1,
      cost: estimateImageCost(generated.inputTokens, generated.outputTokens),
    });
  }
  await client
    .from("posts")
    .update({
      status: "PENDING_APPROVAL",
      cover_media_asset_id: coverId,
      generation_completed_at: new Date().toISOString(),
    })
    .eq("id", post.id);
  await client
    .from("generation_jobs")
    .update({
      status: "COMPLETED",
      finished_at: new Date().toISOString(),
      lease_expires_at: null,
      output_snapshot: { versionId: version.id, coverAssetId: coverId },
    })
    .eq("id", job.id);
  if (revision?.revisionId)
    await client
      .from("revision_requests")
      .update({
        result_version_id: version.id,
        status: "RESOLVED",
        resolved_at: new Date().toISOString(),
      })
      .eq("id", revision.revisionId)
      .throwOnError();
  log("info", "Generation job completed", { jobId: job.id, postId: post.id });
}

export async function failGenerationJob(
  client: SupabaseClient,
  job: Job,
  error: unknown,
) {
  const message =
    error instanceof Error ? error.message : "Unknown generation failure";
  const retry = job.attempt_count < job.max_attempts;
  await client
    .from("generation_jobs")
    .update({
      status: retry ? "QUEUED" : "FAILED",
      last_error: message,
      run_after: new Date(
        Date.now() + Math.min(60, 2 ** job.attempt_count) * 60_000,
      ).toISOString(),
      lease_expires_at: null,
      finished_at: retry ? null : new Date().toISOString(),
    })
    .eq("id", job.id);
  if (!retry)
    await client
      .from("posts")
      .update({
        status: "FAILED",
        failure_code: "GENERATION_FAILED",
        failure_message: message,
      })
      .eq("id", job.post_id);
  log("error", "Generation job failed", {
    jobId: job.id,
    retry,
    error: message,
  });
}
