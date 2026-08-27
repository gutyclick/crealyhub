import {randomBytes} from "node:crypto";
import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {authorizationUrl} from "@/lib/instagram/auth";
import {createSupabaseServerClient} from "@/lib/supabase/server";
export async function GET(){const supabase=await createSupabaseServerClient();const{data}=await supabase.auth.getUser();if(!data.user)return NextResponse.redirect(new URL("/login",process.env.NEXT_PUBLIC_APP_URL??"http://localhost:3000"));const state=randomBytes(24).toString("base64url");const store=await cookies();store.set("instagram_oauth_state",state,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:600});try{return NextResponse.redirect(authorizationUrl(state))}catch(error){return NextResponse.redirect(new URL(`/settings/instagram?error=${encodeURIComponent(error instanceof Error?error.message:"Meta configuration missing")}`,process.env.NEXT_PUBLIC_APP_URL??"http://localhost:3000"))}}
