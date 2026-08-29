import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { enqueueGeneration } from "@/lib/jobs/queue";
import { NoopNotificationProvider } from "@/lib/notifications/provider";

type Format = "POST" | "CAROUSEL" | "STORY";
const formats: Format[] = ["POST", "CAROUSEL", "POST", "STORY"];

export async function automationAllowed(db:SupabaseClient,brandId:string){
  const month=new Date();month.setUTCDate(1);month.setUTCHours(0,0,0,0);
  const day=new Date();day.setUTCHours(0,0,0,0);
  const [{data:monthRows},{data:dayRows}]=await Promise.all([
    db.from("generation_usage").select("estimated_cost_usd").eq("brand_id",brandId).gte("created_at",month.toISOString()),
    db.from("generation_usage").select("images").eq("brand_id",brandId).gte("created_at",day.toISOString()),
  ]);
  const cost=(monthRows??[]).reduce((n,r)=>n+Number(r.estimated_cost_usd),0);
  const images=(dayRows??[]).reduce((n,r)=>n+Number(r.images),0);
  return {allowed:true,cost,images};
}

export async function fillContentBuffer(db:SupabaseClient,options?:{brandId?:string;days?:number;batchSize?:number;source?:"AUTO"|"MANUAL"}){
  const owner=crypto.randomUUID();const lockKey=`content-buffer:${options?.brandId??"all"}`;
  const {data:locked,error:lockError}=await db.rpc("acquire_automation_lock",{target_key:lockKey,target_owner:owner,ttl_seconds:300});
  if(lockError)throw lockError;if(!locked)return {locked:true,created:0,brands:0};
  try{
    let query=db.from("brands").select("id,name,content_strategies!inner(buffer_days,daily_frequency_max,is_active)").eq("content_strategies.is_active",true);
    if(options?.brandId)query=query.eq("id",options.brandId);
    const {data:brands,error}=await query;if(error)throw error;
    let created=0;const notifier=new NoopNotificationProvider();
    for(const brand of brands??[]){
      const strategy=Array.isArray(brand.content_strategies)?brand.content_strategies[0]:brand.content_strategies;
      const days=options?.days??strategy?.buffer_days??env.CONTENT_BUFFER_DAYS;
      const perDay=strategy?.daily_frequency_max??env.TARGET_CONTENT_PER_DAY;
      const target=days*perDay;const horizon=new Date(Date.now()+days*86_400_000);
      const {count}=await db.from("posts").select("id",{count:"exact",head:true}).eq("brand_id",brand.id).gte("scheduled_at",new Date().toISOString()).lte("scheduled_at",horizon.toISOString()).not("status","in",'(REJECTED,FAILED)');
      const missing=Math.max(0,target-(count??0));
      if(missing===0)continue;
      await notifier.send("BUFFER_LOW",{brandId:brand.id,available:count??0,target});
      const limit=Math.min(missing,options?.batchSize??env.MAX_AUTOMATION_BATCH_SIZE);
      const allowance=await automationAllowed(db,brand.id);
      if(!allowance.allowed){await notifier.send("BUDGET_WARNING",{brandId:brand.id,...allowance});continue;}
      const {data:run}=await db.from("agent_runs").insert({brand_id:brand.id,run_type:"CONTENT_PLANNER",status:"RUNNING",summary:`Rellenando ${limit} espacios del buffer`,decision:{target,available:count??0,source:options?.source??"AUTO"}}).select("id").single();
      try{
        for(let index=0;index<limit;index++){
          const format=formats[((count??0)+index)%formats.length];
          const scheduledAt=new Date(Date.now()+(Math.floor(((count??0)+index)/perDay)+1)*86_400_000+((index%perDay)*3)*3_600_000);
          const {data:idea,error:ideaError}=await db.from("content_ideas").insert({brand_id:brand.id,topic:"AUTO",objective:"AUTO",concept:"Contenido planificado automáticamente para mantener el buffer editorial.",recommended_format:format,planned_for:scheduledAt.toISOString(),status:"IDEA"}).select("id").single();if(ideaError)throw ideaError;
          const {data:post,error:postError}=await db.from("posts").insert({brand_id:brand.id,idea_id:idea.id,format,status:"IDEA",scheduled_at:scheduledAt.toISOString()}).select("id").single();if(postError)throw postError;
          await enqueueGeneration(db,{brandId:brand.id,postId:post.id,jobType:`GENERATE_${format}`});created++;
        }
        if(run)await db.from("agent_runs").update({status:"COMPLETED",summary:`${limit} piezas añadidas al buffer`,finished_at:new Date().toISOString()}).eq("id",run.id);
      }catch(cause){if(run)await db.from("agent_runs").update({status:"FAILED",summary:cause instanceof Error?cause.message:"Error de automatización",finished_at:new Date().toISOString(),error_code:"BUFFER_FILL_FAILED"}).eq("id",run.id);throw cause;}
    }
    return {locked:false,created,brands:brands?.length??0};
  }finally{await db.rpc("release_automation_lock",{target_key:lockKey,target_owner:owner});}
}
