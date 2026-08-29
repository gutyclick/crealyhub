import OpenAI, { toFile } from "openai";
import type { ImagesResponse } from "openai/resources/images";
import sharp from "sharp";
import { env } from "@/lib/env";
import type { VisualPrompt } from "@/lib/ai/schemas";

export type ImageFormat = "POST" | "STORY" | "CAROUSEL";
export type GeneratedImage = {
  bytes: Buffer;
  mimeType: "image/jpeg";
  model: string;
  inputTokens: number;
  outputTokens: number;
};
export interface ImageProvider {
  generate(prompt: VisualPrompt, format: ImageFormat): Promise<GeneratedImage>;
  edit(
    sources: Buffer[],
    prompt: VisualPrompt,
    format: ImageFormat,
  ): Promise<GeneratedImage>;
}

const sizes: Record<ImageFormat, string> = {
  POST: "1024x1280",
  CAROUSEL: "1024x1280",
  STORY: "1024x1824",
};
function renderPrompt(spec: VisualPrompt, format: ImageFormat) {
  return [
    `Instagram ${format} creative.`,
    `Subject: ${spec.subject}.`,
    `Composition: ${spec.composition}.`,
    `Art direction: ${spec.artDirection}.`,
    `Palette: ${spec.palette.join(", ")}.`,
    `Required on-image headline, rendered exactly once with perfect spelling: "${spec.displayText}".`,
    `Typography and hierarchy: ${spec.typographyGuidance}.`,
    `Text placement and safe area: ${spec.textPlacement}.`,
    `Reserve clean negative space for the real logo at ${spec.logoPlacement}, ${spec.logoScale} scale. Do not draw a placeholder logo.`,
    `The headline must be clearly legible at phone size and integrated into the composition, not added as an afterthought. Use no other words.`,
    `Avoid: ${spec.negativeInstructions.join(", ")}.`,
    `No logos, watermarks, UI chrome, misspelled text, extra text, or unsafe edge placement.`,
  ].join("\n");
}

export class OpenAIImageProvider implements ImageProvider {
  private client: OpenAI;
  constructor(apiKey = env.OPENAI_API_KEY) {
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");
    this.client = new OpenAI({
      apiKey,
      timeout: env.OPENAI_REQUEST_TIMEOUT_MS,
      maxRetries: 2,
    });
  }
  async generate(prompt: VisualPrompt, format: ImageFormat) {
    const response = await this.client.images.generate({
      model: env.OPENAI_IMAGE_MODEL,
      prompt: renderPrompt(prompt, format),
      size: sizes[format],
      quality: "medium",
      output_format: "jpeg",
      output_compression: 92,
      n: 1,
      stream: false,
    });
    return this.unpack(response);
  }
  async edit(sources: Buffer[], prompt: VisualPrompt, format: ImageFormat) {
    const images = await Promise.all(sources.slice(0,4).map(async(source,index)=>{
      const normalized=await sharp(source).rotate().resize(1536,1536,{fit:"inside",withoutEnlargement:true}).png().toBuffer();
      return toFile(normalized,`reference-${index+1}.png`,{type:"image/png"});
    }));
    const response = await this.client.images.edit({
      model: env.OPENAI_IMAGE_MODEL,
      image:images,
      prompt: `Treat all supplied images together as a strict creative reference set. Infer the recurring design grammar across them and follow it closely: typography attitude, hierarchy, contrast, density, whitespace, shapes, framing, material treatment, lighting, texture, and finish quality. The result must visibly belong to the same brand family. Create a new original design for the requested post. Do not reproduce any one reference's specific layout, scene, pose, camera angle, characters, objects, illustration, wording, background, or arrangement. Preserve the shared visual system without making a derivative copy. Brand colors should anchor the image, while props and small elements may use harmonious varied colors.\n${renderPrompt(prompt, format)}`,
      size: sizes[format],
      quality: "medium",
      output_format: "jpeg",
      stream: false,
    });
    return this.unpack(response);
  }
  private unpack(response: ImagesResponse): GeneratedImage {
    const base64 = response.data?.[0]?.b64_json;
    if (!base64) throw new Error("Image provider returned no image data.");
    return {
      bytes: Buffer.from(base64, "base64"),
      mimeType: "image/jpeg",
      model: env.OPENAI_IMAGE_MODEL,
      inputTokens: response.usage?.input_tokens ?? 0,
      outputTokens: response.usage?.output_tokens ?? 0,
    };
  }
}
