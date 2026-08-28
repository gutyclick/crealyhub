import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { runGenerationQueue } from "@/lib/jobs/generation-worker";
function authorized(request:Request){const expected=env.CRON_SECRET;const supplied=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"");if(!expected||!supplied||expected.length!==supplied.length)return false;return timingSafeEqual(Buffer.from(expected),Buffer.from(supplied))}
async function run(request:Request){if(!authorized(request))return NextResponse.json({error:"Unauthorized"},{status:401});try{return NextResponse.json(await runGenerationQueue())}catch(cause){return NextResponse.json({error:cause instanceof Error?cause.message:"Unknown generation worker error"},{status:500})}}
export const GET=run;export const POST=run;
