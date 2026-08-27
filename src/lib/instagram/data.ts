import {createSupabaseServerClient} from "@/lib/supabase/server";
export async function getInstagramConnection(){const supabase=await createSupabaseServerClient();const{data}=await supabase.from("instagram_accounts").select("id,username,account_type,status,permissions,token_expires_at,last_validated_at,last_sync_at,last_error").maybeSingle();return data}
