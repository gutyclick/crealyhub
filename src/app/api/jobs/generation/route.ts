import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { failGenerationJob,processGenerationJob } from "@/lib/jobs/generation";
function authorized(request:Request){const expected=env.CRON_SECRET;const supplied=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"");if(!expected||!supplied||expected.length!==supplied.length)return false;return timingSafeEqual(Buffer.from(expected),Buffer.from(supplied))}
async function run(request:Request){if(!authorized(request))return NextResponse.json({error:"Unauthorized"},{status:401});const client=createSupabaseAdminClient();const worker=`generation-${crypto.randomUUID()}`;const{data,error}=await client.rpc("claim_generation_jobs",{worker_name:worker,job_limit:env.MAX_CONCURRENT_GENERATIONS});if(error)return NextResponse.json({error:error.message},{status:500});const jobs=(data??[]) as Array<{id:string;brand_id:string;post_id:string;attempt_count:number;max_attempts:number}>;const results=await Promise.all(jobs.map(async job=>{try{await processGenerationJob(client,job);return{id:job.id,status:"COMPLETED"}}catch(cause){await failGenerationJob(client,job,cause);return{id:job.id,status:"FAILED",error:cause instanceof Error?cause.message:"Unknown error"}}}));return NextResponse.json({worker,claimed:jobs.length,results})}
export const GET=run;export const POST=run;
