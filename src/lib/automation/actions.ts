"use server";
import {revalidatePath} from "next/cache";
import {fillContentBuffer} from "@/lib/automation/buffer";
import {createSupabaseAdminClient} from "@/lib/supabase/admin";
import {createSupabaseServerClient} from "@/lib/supabase/server";
export async function generateBatch(formData:FormData){
  const db=await createSupabaseServerClient();const{data:auth}=await db.auth.getUser();if(!auth.user)return;
  const{data:brand}=await db.from("brands").select("id").eq("owner_user_id",auth.user.id).limit(1).maybeSingle();if(!brand)return;
  const days=formData.get("period")==="week"?7:1;
  await fillContentBuffer(createSupabaseAdminClient(),{brandId:brand.id,days,batchSize:days===7?7:3,source:"MANUAL"});
  revalidatePath("/create");revalidatePath("/settings/usage");revalidatePath("/overview");
}
