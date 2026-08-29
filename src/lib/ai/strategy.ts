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
      "Actúa como director de arte editorial. Convierte el concepto y la referencia creativa en una especificación visual ejecutable. Sigue con bastante rigor el lenguaje de las referencias: jerarquía, densidad, ritmo, contraste, proporción entre texto e imagen, tratamiento tipográfico, materiales, iluminación, textura y nivel de acabado. No copies ni reconstruyas ninguna pieza: cambia por completo composición, escena, encuadre, pose, personajes, objetos y distribución concreta. El resultado debe pertenecer a la misma familia estética, pero ser una creación original para este post. Elige una escena narrativa, no una plantilla abstracta. Imagina elementos bellos y pertinentes: objetos simbólicos, utilería diseñada, texturas, profundidad, detalles artesanales o personajes originales. Si conviene presencia humana, usa personas naturales, gestos creíbles, piel realista, ropa y entorno específicos; evita poses de stock. Incluye siempre un solo titular visible y protagonista, derivado del headline o hook del concepto: displayText debe ser una frase exacta de 3 a 9 palabras, en el idioma de la marca, sin hashtags, sin CTA adicional y sin inventar otra promesa. Define una ubicación segura y una jerarquía clara; el texto debe atraer sin cubrir el sujeto ni sobrecargar la pieza. Usa los colores principales del branding como ancla y admite colores diversos en objetos y acentos si armonizan. Interpreta aprobaciones como preferencias y rechazos como restricciones sin repetir diseños. Evita stock genérico, renders plásticos, anatomía incorrecta, fondos vacíos, clichés corporativos, collage arbitrario, texto pequeño, párrafos, letras deformes o palabras adicionales. El logo real se aplica después del render.",
    input: JSON.stringify({ brand, concept, format }),
  });
}
