import { createHash } from "node:crypto";
import sharp from "sharp";
import type { ImageFormat } from "@/lib/ai/image-generator";
import type { StorageProvider } from "@/lib/storage/provider";
const dimensions: Record<ImageFormat, { width: number; height: number }> = {
  POST: { width: 1080, height: 1350 },
  CAROUSEL: { width: 1080, height: 1350 },
  STORY: { width: 1080, height: 1920 },
};
export async function finalizeImage(
  storage: StorageProvider,
  input: Buffer,
  format: ImageFormat,
  key: string,
  logo?: Buffer,
) {
  const target = dimensions[format];
  const base = sharp(input)
    .rotate()
    .resize(target.width, target.height, {
      fit: "cover",
      position: "attention",
    });
  const logoLayer = logo
    ? await sharp(logo)
        .rotate()
        .resize({ width: Math.round(target.width * 0.16), height: Math.round(target.height * 0.1), fit: "inside", withoutEnlargement: true })
        .png()
        .toBuffer()
    : null;
  const output = await (logoLayer
    ? base.composite([{ input: logoLayer, gravity: "southeast" }])
    : base)
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();
  const metadata = await sharp(output).metadata();
  const checksum = createHash("sha256").update(output).digest("hex");
  const stored = await storage.put(
    key,
    output.buffer.slice(
      output.byteOffset,
      output.byteOffset + output.byteLength,
    ) as ArrayBuffer,
    "image/jpeg",
  );
  return {
    ...stored,
    width: metadata.width ?? target.width,
    height: metadata.height ?? target.height,
    checksum,
  };
}
