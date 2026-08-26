"use server";

import { revalidatePath } from "next/cache";
import { brandFormSchema } from "@/lib/brand/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type BrandActionState = { ok: boolean; message: string };

const splitLines = (value: string) =>
  value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);

export async function saveBrand(
  _previous: BrandActionState,
  formData: FormData,
): Promise<BrandActionState> {
  const parsed = brandFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    productService: formData.get("productService"),
    website: formData.get("website"),
    audience: formData.get("audience"),
    objectives: formData.get("objectives"),
    tone: formData.get("tone"),
    personality: formData.get("personality"),
    defaultCta: formData.get("defaultCta"),
    language: formData.get("language"),
    timezone: formData.get("timezone"),
    allowedPhrases: formData.get("allowedPhrases"),
    forbiddenPhrases: formData.get("forbiddenPhrases"),
    hashtagRules: formData.get("hashtagRules"),
    editorialRules: formData.get("editorialRules"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Revisa los campos." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { ok: false, message: "Tu sesión expiró. Vuelve a entrar." };

  const values = parsed.data;
  const record = {
    owner_user_id: authData.user.id,
    name: values.name,
    description: values.description,
    product_service: values.productService,
    website: values.website || null,
    audience: values.audience,
    objectives: values.objectives,
    tone: values.tone,
    personality: values.personality,
    default_cta: values.defaultCta,
    language: values.language,
    timezone: values.timezone,
    allowed_phrases: splitLines(values.allowedPhrases),
    forbidden_phrases: splitLines(values.forbiddenPhrases),
    hashtag_rules: values.hashtagRules,
    editorial_rules: values.editorialRules,
  };
  const { data: existing } = await supabase
    .from("brands").select("id").eq("owner_user_id", authData.user.id).limit(1).maybeSingle();
  const query = existing
    ? supabase.from("brands").update(record).eq("id", existing.id)
    : supabase.from("brands").insert(record);
  const { error } = await query;
  if (error) return { ok: false, message: `No se pudo guardar: ${error.message}` };
  revalidatePath("/settings/brand");
  revalidatePath("/overview");
  return { ok: true, message: "Brand Memory guardada." };
}
