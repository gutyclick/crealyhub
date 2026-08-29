"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AssetActionState = { ok: boolean; message: string };
const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
const kindSchema = z.enum(["LOGO", "VISUAL_REFERENCE", "PRODUCT"]);
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

async function context() {
  const db = await createSupabaseServerClient();
  const { data: auth } = await db.auth.getUser();
  if (!auth.user) throw new Error("Tu sesión expiró.");
  const { data: brand } = await db
    .from("brands")
    .select("id")
    .eq("owner_user_id", auth.user.id)
    .limit(1)
    .maybeSingle();
  if (!brand) throw new Error("Guarda Brand Memory antes de subir archivos.");
  return { db, userId: auth.user.id, brandId: brand.id };
}

export async function uploadBrandAsset(
  _previous: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  try {
    const file = formData.get("file");
    const kind = kindSchema.parse(formData.get("kind"));
    const label = String(formData.get("label") ?? "")
      .trim()
      .slice(0, 120);
    if (!(file instanceof File) || file.size === 0)
      return { ok: false, message: "Selecciona una imagen." };
    if (!allowed.has(file.type))
      return { ok: false, message: "Usa una imagen PNG, JPG o WebP." };
    if (file.size > 4 * 1024 * 1024)
      return { ok: false, message: "La imagen debe pesar menos de 4 MB." };
    const { db, userId, brandId } = await context();
    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
    const objectKey = `${userId}/${brandId}/brand/${randomUUID()}.${extension}`;
    const bucket = env.SUPABASE_STORAGE_BUCKET;
    const { error: uploadError } = await db.storage
      .from(bucket)
      .upload(objectKey, file, {
        contentType: file.type,
        upsert: false,
        cacheControl: "3600",
      });
    if (uploadError)
      return { ok: false, message: `No se pudo subir: ${uploadError.message}` };
    const { data: media, error: mediaError } = await db
      .from("media_assets")
      .insert({
        brand_id: brandId,
        kind,
        storage_provider: "supabase",
        bucket,
        object_key: objectKey,
        mime_type: file.type,
        bytes: file.size,
        is_final: false,
      })
      .select("id")
      .single();
    if (mediaError) {
      await db.storage.from(bucket).remove([objectKey]);
      return {
        ok: false,
        message: `No se pudo registrar: ${mediaError.message}`,
      };
    }
    const { error: assetError } = await db
      .from("brand_assets")
      .insert({
        brand_id: brandId,
        media_asset_id: media.id,
        kind,
        label: label || file.name,
        notes: "Subido desde Brand Memory",
      });
    if (assetError) {
      await db.from("media_assets").delete().eq("id", media.id);
      await db.storage.from(bucket).remove([objectKey]);
      return {
        ok: false,
        message: `No se pudo guardar: ${assetError.message}`,
      };
    }
    revalidatePath("/settings/brand");
    return {
      ok: true,
      message: kind === "LOGO" ? "Logo guardado." : "Referencia guardada.",
    };
  } catch (cause) {
    return {
      ok: false,
      message:
        cause instanceof Error ? cause.message : "No se pudo subir la imagen.",
    };
  }
}

export async function deleteBrandAsset(assetId: string) {
  const id = z.uuid().parse(assetId);
  const { db } = await context();
  const { data: asset } = await db
    .from("brand_assets")
    .select("id,media_asset_id,media_assets(bucket,object_key)")
    .eq("id", id)
    .single();
  if (!asset) throw new Error("El archivo ya no existe.");
  const media = Array.isArray(asset.media_assets)
    ? asset.media_assets[0]
    : asset.media_assets;
  if (media) await db.storage.from(media.bucket).remove([media.object_key]);
  await db.from("brand_assets").delete().eq("id", id).throwOnError();
  await db
    .from("media_assets")
    .delete()
    .eq("id", asset.media_asset_id)
    .throwOnError();
  revalidatePath("/settings/brand");
}

export async function getBrandAssets() {
  const db = await createSupabaseServerClient();
  const { data, error } = await db
    .from("brand_assets")
    .select(
      "id,kind,label,notes,sort_order,media_assets(bucket,object_key,mime_type,created_at)",
    )
    .order("sort_order");
  if (error) throw new Error(`No se pudieron cargar los materiales de marca: ${error.message}`);
  return Promise.all(
    (data ?? []).map(async (asset) => {
      const media = Array.isArray(asset.media_assets)
        ? asset.media_assets[0]
        : asset.media_assets;
      const { data: url } = media
        ? await db.storage
            .from(media.bucket)
            .createSignedUrl(media.object_key, 3600)
        : { data: null };
      return {
        id: asset.id,
        kind: asset.kind as "LOGO" | "VISUAL_REFERENCE" | "PRODUCT",
        label: asset.label,
        createdAt: media?.created_at ?? "",
        url: url?.signedUrl ?? null,
      };
    }),
  );
}

export async function saveBrandStyle(
  _previous: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  try {
    const { db, brandId } = await context();
    const colors = [
      {
        name: "Principal",
        role: "primary",
        hex: hex.parse(formData.get("primaryColor")),
      },
      {
        name: "Secundario",
        role: "secondary",
        hex: hex.parse(formData.get("secondaryColor")),
      },
      {
        name: "Acento",
        role: "accent",
        hex: hex.parse(formData.get("accentColor")),
      },
    ];
    const display = String(formData.get("displayFont") ?? "")
      .trim()
      .slice(0, 100);
    const body = String(formData.get("bodyFont") ?? "")
      .trim()
      .slice(0, 100);
    await db.from("brand_colors").delete().eq("brand_id", brandId);
    await db
      .from("brand_colors")
      .insert(
        colors.map((color, index) => ({
          ...color,
          brand_id: brandId,
          sort_order: index,
        })),
      )
      .throwOnError();
    if (display)
      await db
        .from("brand_fonts")
        .upsert(
          { brand_id: brandId, name: display, role: "DISPLAY" },
          { onConflict: "brand_id,role" },
        )
        .throwOnError();
    if (body)
      await db
        .from("brand_fonts")
        .upsert(
          { brand_id: brandId, name: body, role: "BODY" },
          { onConflict: "brand_id,role" },
        )
        .throwOnError();
    revalidatePath("/settings/brand");
    return { ok: true, message: "Estilo visual guardado." };
  } catch (cause) {
    return {
      ok: false,
      message:
        cause instanceof Error
          ? cause.message
          : "No se pudo guardar el estilo.",
    };
  }
}

export async function getBrandStyle() {
  const db = await createSupabaseServerClient();
  const [{ data: colors }, { data: fonts }] = await Promise.all([
    db.from("brand_colors").select("role,hex").order("sort_order"),
    db.from("brand_fonts").select("role,name"),
  ]);
  const color = (role: string, fallback: string) =>
    colors?.find((item) => item.role === role)?.hex ?? fallback;
  const font = (role: string) =>
    fonts?.find((item) => item.role === role)?.name ?? "";
  return {
    primaryColor: color("primary", "#6457E8"),
    secondaryColor: color("secondary", "#17213C"),
    accentColor: color("accent", "#FF8C78"),
    displayFont: font("DISPLAY"),
    bodyFont: font("BODY"),
  };
}
