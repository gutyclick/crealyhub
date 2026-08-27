import "server-only";
import {env} from "@/lib/env";
import {createSupabaseServerClient} from "@/lib/supabase/server";
export async function getUsageDashboard(){
  const db=await createSupabaseServerClient();const{data:auth}=await db.auth.getUser();if(!auth.user)return null;
  const{data:brand}=await db.from("brands").select("id").eq("owner_user_id",auth.user.id).limit(1).maybeSingle();if(!brand)return null;
  const month=new Date();month.setUTCDate(1);month.setUTCHours(0,0,0,0);const day=new Date();day.setUTCHours(0,0,0,0);
  const [{data:usage},{count:queued},{count:buffered},{data:runs}]=await Promise.all([
    db.from("generation_usage").select("operation,images,estimated_cost_usd,created_at").eq("brand_id",brand.id).gte("created_at",month.toISOString()),
    db.from("generation_jobs").select("id",{count:"exact",head:true}).eq("brand_id",brand.id).eq("status","QUEUED"),
    db.from("posts").select("id",{count:"exact",head:true}).eq("brand_id",brand.id).gte("scheduled_at",new Date().toISOString()).not("status","in",'(REJECTED,FAILED)'),
    db.from("agent_runs").select("id,status,summary,started_at").eq("brand_id",brand.id).eq("run_type","CONTENT_PLANNER").order("started_at",{ascending:false}).limit(5),
  ]);
  const rows=usage??[];const todayImages=rows.filter(r=>new Date(r.created_at)>=day).reduce((n,r)=>n+Number(r.images),0);
  return {cost:rows.reduce((n,r)=>n+Number(r.estimated_cost_usd),0),todayImages,textGenerations:rows.filter(r=>Number(r.images)===0).length,queued:queued??0,buffered:buffered??0,runs:runs??[],limits:{budget:env.MONTHLY_AI_BUDGET_USD,imagesPerDay:env.MAX_IMAGES_PER_DAY,bufferDays:env.CONTENT_BUFFER_DAYS,targetPerDay:env.TARGET_CONTENT_PER_DAY}};
}
