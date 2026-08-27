import "server-only";
import type {SupabaseClient} from "@supabase/supabase-js";
import {InstagramClient} from "@/lib/instagram/client";
import {decryptToken} from "@/lib/instagram/crypto";
import {log} from "@/lib/observability/logger";

const metrics=["views","reach","saved","shares","total_interactions"] as const;
type Values={views:number|null;reach:number|null;saves:number|null;shares:number|null;total_interactions:number|null;likes:number|null;comments:number|null};
type PerformanceRow={post_id:string;engagement_rate:number;captured_at:string;posts:Array<{format:string;content_pillars:Array<{name:string}>}>};

export async function syncAnalytics(db:SupabaseClient){
  const owner=crypto.randomUUID();const{data:locked,error:lockError}=await db.rpc("acquire_automation_lock",{target_key:"analytics-sync",target_owner:owner,ttl_seconds:300});if(lockError)throw lockError;if(!locked)return{locked:true,synced:0,failed:0};
  try{
    const{data:accounts,error}=await db.from("instagram_accounts").select("id,brand_id,instagram_user_id,access_token_ciphertext,permissions").eq("status","CONNECTED");if(error)throw error;
    let synced=0,failed=0;
    for(const account of accounts??[]){
      if(!account.permissions.includes("instagram_business_manage_insights")){failed++;continue;}
      const client=new InstagramClient(decryptToken(account.access_token_ciphertext),account.instagram_user_id);
      const{data:posts}=await db.from("posts").select("id,instagram_media_id").eq("brand_id",account.brand_id).eq("status","PUBLISHED").not("instagram_media_id","is",null).order("published_at",{ascending:false}).limit(50);
      for(const post of posts??[]){try{
        const values:Values={views:null,reach:null,saves:null,shares:null,total_interactions:null,likes:null,comments:null};const raw:Record<string,unknown>={};
        const counts=await client.mediaCounts(post.instagram_media_id);values.likes=counts.like_count??null;values.comments=counts.comments_count??null;raw.counts=counts;
        for(const metric of metrics){try{const response=await client.insight(post.instagram_media_id,metric);raw[metric]=response;const item=response.data[0];const value=item?.total_value?.value??item?.values?.at(-1)?.value??null;if(metric==="saved")values.saves=value;else values[metric]=value;}catch(cause){raw[`${metric}_unavailable`]=cause instanceof Error?cause.message:"Unavailable";}}
        const denominator=values.reach??values.views??0;const interactions=values.total_interactions??[values.likes,values.comments,values.shares,values.saves].reduce<number>((n,v)=>n+(v??0),0);
        await db.from("analytics").upsert({brand_id:account.brand_id,post_id:post.id,views:values.views,reach:values.reach,likes:values.likes,comments:values.comments,shares:values.shares,saves:values.saves,total_interactions:interactions,engagement_rate:denominator?interactions/denominator:null,save_rate:denominator?(values.saves??0)/denominator:null,share_rate:denominator?(values.shares??0)/denominator:null,raw_response:raw,captured_at:new Date().toISOString()},{onConflict:"post_id,snapshot_date"}).throwOnError();synced++;
      }catch(cause){failed++;log("warn","Analytics media sync failed",{postId:post.id,error:cause instanceof Error?cause.message:"Unknown"});}}
      await rebuildPerformancePatterns(db,account.brand_id);await db.from("instagram_accounts").update({last_sync_at:new Date().toISOString()}).eq("id",account.id);
    }
    return{locked:false,synced,failed};
  }finally{await db.rpc("release_automation_lock",{target_key:"analytics-sync",target_owner:owner});}
}

async function rebuildPerformancePatterns(db:SupabaseClient,brandId:string){
  const{data}=await db.from("analytics").select("post_id,engagement_rate,captured_at,posts(format,content_pillars(name))").eq("brand_id",brandId).not("engagement_rate","is",null).order("captured_at",{ascending:false});
  const latest=new Map<string,PerformanceRow>();for(const row of (data??[]) as PerformanceRow[])if(!latest.has(row.post_id))latest.set(row.post_id,row);
  const rows=[...latest.values()];if(rows.length<3)return;const baseline=rows.reduce((n,r)=>n+Number(r.engagement_rate),0)/rows.length;
  const groups=new Map<string,{dimension:"FORMAT"|"PILLAR";value:string;rates:number[]}>();
  for(const row of rows){const post=Array.isArray(row.posts)?row.posts[0]:row.posts;if(!post)continue;const pillar=Array.isArray(post.content_pillars)?post.content_pillars[0]:post.content_pillars;for(const item of [{dimension:"FORMAT" as const,value:post.format},{dimension:"PILLAR" as const,value:pillar?.name}])if(item.value){const key=`${item.dimension}:${item.value}`;const group=groups.get(key)??{...item,rates:[]};group.rates.push(Number(row.engagement_rate));groups.set(key,group);}}
  for(const group of groups.values()){if(group.rates.length<2)continue;const average=group.rates.reduce((a,b)=>a+b,0)/group.rates.length;const lift=baseline?((average-baseline)/baseline)*100:0;const confidence=group.rates.length>=10?"HIGH":group.rates.length>=5?"MEDIUM":"LOW";await db.from("performance_patterns").upsert({brand_id:brandId,dimension:group.dimension,dimension_value:group.value,sample_size:group.rates.length,average_engagement_rate:average,baseline_engagement_rate:baseline,lift_percentage:lift,confidence,summary:`${group.value} rinde ${Math.abs(lift).toFixed(0)}% ${lift>=0?"sobre":"bajo"} el baseline con ${group.rates.length} piezas.` ,calculated_at:new Date().toISOString()},{onConflict:"brand_id,dimension,dimension_value"});}
}
