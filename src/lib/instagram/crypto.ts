import "server-only";
import {createCipheriv,createDecipheriv,createHash,randomBytes} from "node:crypto";
import {env} from "@/lib/env";
function key(){if(!env.TOKEN_ENCRYPTION_KEY)throw new Error("TOKEN_ENCRYPTION_KEY is not configured");return createHash("sha256").update(env.TOKEN_ENCRYPTION_KEY).digest()}
export function encryptToken(value:string){const iv=randomBytes(12);const cipher=createCipheriv("aes-256-gcm",key(),iv);const encrypted=Buffer.concat([cipher.update(value,"utf8"),cipher.final()]);return [iv,cipher.getAuthTag(),encrypted].map(v=>v.toString("base64url")).join(".")}
export function decryptToken(value:string){const[iv,tag,data]=value.split(".").map(v=>Buffer.from(v,"base64url"));if(!iv||!tag||!data)throw new Error("Invalid encrypted token");const decipher=createDecipheriv("aes-256-gcm",key(),iv);decipher.setAuthTag(tag);return Buffer.concat([decipher.update(data),decipher.final()]).toString("utf8")}
