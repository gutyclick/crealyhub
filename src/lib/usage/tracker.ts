import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
export function estimateTextCost(input:number,output:number){return(input*env.AI_TEXT_INPUT_USD_PER_MILLION+output*env.AI_TEXT_OUTPUT_USD_PER_MILLION)/1_000_000}
export function estimateImageCost(input:number,output:number){return(input*env.AI_IMAGE_INPUT_USD_PER_MILLION+output*env.AI_IMAGE_OUTPUT_USD_PER_MILLION)/1_000_000}
export async function recordUsage(client:SupabaseClient,row:{brandId:string;postId?:string;provider:string;model:string;operation:string;inputTokens:number;outputTokens:number;images?:number;cost:number}){const{error}=await client.from("generation_usage").insert({brand_id:row.brandId,post_id:row.postId??null,provider:row.provider,model:row.model,operation:row.operation,input_tokens:row.inputTokens,output_tokens:row.outputTokens,images:row.images??0,estimated_cost_usd:row.cost});if(error)throw new Error(`Usage tracking failed: ${error.message}`)}
