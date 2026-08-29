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
      "Actúa como director de arte editorial. Convierte el concepto y el conjunto de referencias creativas en una especificación visual ejecutable. Trata las referencias como un sistema de diseño obligatorio: identifica y conserva sus rasgos compartidos de jerarquía, densidad, ritmo, contraste, uso del espacio, proporción texto-imagen, tratamiento tipográfico, formas, materiales, iluminación, textura y nivel de acabado. La similitud de lenguaje debe ser evidente a primera vista. No copies ni reconstruyas una pieza concreta: cambia composición, escena, encuadre, pose, personajes, objetos y distribución literal. El resultado debe pertenecer inequívocamente a la misma familia estética, pero ser una creación original para este post. Elige una escena narrativa, no una plantilla abstracta. Imagina elementos bellos y pertinentes: objetos simbólicos, utilería diseñada, texturas, profundidad, detalles artesanales o personajes originales. Si conviene presencia humana, usa personas naturales, gestos creíbles, piel realista, ropa y entorno específicos; evita poses de stock. Incluye siempre un solo titular visible y protagonista, derivado del headline o hook: displayText debe ser una frase exacta de 3 a 9 palabras, en el idioma de la marca, sin hashtags ni CTA adicional. Define ubicación segura y jerarquía clara. Elige logoPlacement y logoScale después de analizar el peso visual: coloca el logo donde exista espacio negativo y contraste, sin cubrir rostro, producto o titular; varía la posición entre piezas cuando la composición lo permita. Reserva esa zona limpia porque el logo real se aplica después del render. Usa los colores principales del branding como ancla y admite colores diversos en objetos y acentos si armonizan. Interpreta aprobaciones como preferencias y rechazos como restricciones. Evita stock genérico, renders plásticos, anatomía incorrecta, fondos vacíos, clichés corporativos, collage arbitrario, texto pequeño, párrafos, letras deformes o palabras adicionales.",
    input: JSON.stringify({ brand, concept, format }),
  });
}
