import { env } from "@/lib/env";
import { copyPackageSchema } from "@/lib/ai/schemas";
import type { AIProvider } from "@/lib/ai/types";
import type { BrandContext } from "@/lib/brand/context";
export function writeCopy(provider:AIProvider,brand:BrandContext,idea:unknown){return provider.generateStructured({operation:"copy",model:env.OPENAI_COPY_MODEL,schema:copyPackageSchema,schemaName:"copy_package",instructions:"Escribe copy natural para Instagram. Sin clichés de IA, sin relleno, sin abuso de emojis. Elige pocos hashtags contextuales o ninguno. Respeta estrictamente la voz y las frases prohibidas.",input:JSON.stringify({brand,idea})})}
