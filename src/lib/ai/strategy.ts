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
      "Convierte el concepto editorial en una especificación visual fotográfica y ejecutable. Elige una escena concreta y narrativa, nunca una plantilla abstracta. Imagina elementos bellos, memorables y pertinentes: objetos simbólicos, utilería diseñada, texturas, espacios con profundidad, detalles artesanales o personajes originales. Cuando la idea se beneficie de presencia humana, incluye personas naturales con gestos creíbles, imperfecciones sutiles, piel realista, ropa y entorno específicos; prioriza momentos espontáneos sobre poses de stock. Usa las referencias solo para comprender lenguaje visual, materiales, atmósfera y nivel de acabado: nunca copies su composición, pose, encuadre, ilustración, texto o distribución. Usa los colores principales del branding como ancla dominante y coherente. Puedes introducir colores diversos en objetos, vestuario, utilería y pequeños acentos cuando mejoren la escena, siempre armonizados con la paleta principal. Interpreta la memoria de aprobaciones como preferencias y la de rechazos como restricciones, sin repetir diseños anteriores. Evita stock genérico, renders plásticos, manos deformes, anatomía incorrecta, fondos vacíos, clichés corporativos y texto generado ilegible. Reserva áreas seguras para texto; el logo real se aplica después del render.",
    input: JSON.stringify({ brand, concept, format }),
  });
}
