import {timingSafeEqual} from "node:crypto";
import {NextResponse} from "next/server";
import {fillContentBuffer} from "@/lib/automation/buffer";
import {env} from "@/lib/env";
import {createSupabaseAdminClient} from "@/lib/supabase/admin";
export const maxDuration=60;
function authorized(request:Request){const expected=env.CRON_SECRET;const supplied=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"");if(!expected||!supplied||expected.length!==supplied.length)return false;return timingSafeEqual(Buffer.from(expected),Buffer.from(supplied))}
async function run(request:Request){if(!authorized(request))return NextResponse.json({error:"Unauthorized"},{status:401});try{return NextResponse.json(await fillContentBuffer(createSupabaseAdminClient()))}catch(cause){return NextResponse.json({error:cause instanceof Error?cause.message:"Automation failed"},{status:500})}}
export const GET=run;export const POST=run;
