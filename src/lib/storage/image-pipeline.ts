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
  logoOptions?: {placement:"top-left"|"top-center"|"top-right"|"bottom-left"|"bottom-center"|"bottom-right";scale:"small"|"medium"},
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
        .resize({ width: Math.round(target.width * (logoOptions?.scale==="medium"?0.2:0.14)), height: Math.round(target.height * 0.1), fit: "inside", withoutEnlargement: true })
        .png()
        .toBuffer()
    : null;
  const logoMetadata=logoLayer?await sharp(logoLayer).metadata():null;
  const margin=Math.round(target.width*0.055);
  const logoWidth=logoMetadata?.width??0;
  const logoHeight=logoMetadata?.height??0;
  const placement=logoOptions?.placement??"bottom-right";
  const left=placement.endsWith("left")?margin:placement.endsWith("right")?target.width-margin-logoWidth:Math.round((target.width-logoWidth)/2);
  const top=placement.startsWith("top")?margin:target.height-margin-logoHeight;
  const output = await (logoLayer
    ? base.composite([{ input: logoLayer, left:Math.max(0,left), top:Math.max(0,top) }])
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
