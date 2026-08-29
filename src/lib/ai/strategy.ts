import { env } from "@/lib/env";
import { visualPromptSchema } from "@/lib/ai/schemas";
import type { AIProvider } from "@/lib/ai/types";
import type { BrandContext } from "@/lib/brand/context";
export function buildVisualPrompt(
  provider: AIProvider,
  brand: BrandContext,
  concept: unknown,
  format: string,
) {
  return provider.generateStructured({
    operation: "visual_prompt",
    model: env.OPENAI_STRATEGY_MODEL,
    schema: visualPromptSchema,
    schemaName: "visual_prompt",
    instructions:
      "Convierte el concepto editorial en una especificación visual fotográfica y ejecutable. Elige una escena concreta y narrativa, no una plantilla abstracta. Cuando la idea se beneficie de presencia humana, incluye personas naturales con gestos creíbles, imperfecciones sutiles, piel realista, ropa y entorno específicos; prioriza momentos espontáneos sobre poses de stock. También puedes crear objetos, utilería, espacios y personajes originales acordes con la idea. Respeta las referencias y productos de Brand Memory sin copiarlos literalmente. Define sujeto, composición, luz, lente, textura, dirección artística y paleta. Evita stock genérico, renders plásticos, manos deformes, anatomía incorrecta, fondos vacíos, clichés corporativos y texto generado ilegible. Reserva áreas seguras para texto; el logo real se aplica después del render.",
    input: JSON.stringify({ brand, concept, format }),
  });
}
