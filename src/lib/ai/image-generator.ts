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
    source: Buffer,
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
    `Typography guidance: ${spec.typographyGuidance}.`,
    `Avoid: ${spec.negativeInstructions.join(", ")}.`,
    `No logos, watermarks, UI chrome, gibberish text, or unsafe edge placement.`,
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
  async edit(source: Buffer, prompt: VisualPrompt, format: ImageFormat) {
    const normalized = await sharp(source)
      .rotate()
      .resize(1536, 1536, { fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer();
    const image = await toFile(normalized, "reference.png", {
      type: "image/png",
    });
    const response = await this.client.images.edit({
      model: env.OPENAI_IMAGE_MODEL,
      image,
      prompt: `Use the supplied image only as a loose visual reference for brand mood, material, color, product identity, and finish quality. Create an original scene. Do not reproduce or closely imitate its layout, pose, camera angle, illustration, text, background, or arrangement. Brand colors should anchor the image, while props and small elements may use harmonious varied colors.\n${renderPrompt(prompt, format)}`,
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
