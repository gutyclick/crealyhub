import {timingSafeEqual} from "node:crypto";
import {NextResponse} from "next/server";
import {env} from "@/lib/env";
import {createSupabaseAdminClient} from "@/lib/supabase/admin";
import {failPublishingJob,processPublishingJob} from "@/lib/jobs/publishing";
export const maxDuration=60;
function authorized(request:Request){const expected=env.CRON_SECRET;const supplied=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"");if(!expected||!supplied||expected.length!==supplied.length)return false;return timingSafeEqual(Buffer.from(expected),Buffer.from(supplied))}
async function run(request:Request){if(!authorized(request))return NextResponse.json({error:"Unauthorized"},{status:401});const db=createSupabaseAdminClient();await db.rpc("enqueue_due_publishing_jobs").throwOnError();const worker=`publisher-${crypto.randomUUID()}`;const{data,error}=await db.rpc("claim_publishing_jobs",{worker_name:worker,job_limit:2});if(error)return NextResponse.json({error:error.message},{status:500});const jobs=(data??[]) as Array<{id:string;post_id:string;instagram_account_id:string;attempt_count:number;max_attempts:number}>;const results=[];for(const job of jobs){try{await processPublishingJob(db,job);results.push({id:job.id,status:"COMPLETED"})}catch(cause){await failPublishingJob(db,job,cause);results.push({id:job.id,status:"FAILED",error:cause instanceof Error?cause.message:"Unknown error"})}}return NextResponse.json({worker,claimed:jobs.length,results})}
export const GET=run;export const POST=run;
