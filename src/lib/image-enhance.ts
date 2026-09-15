import { createHash } from "node:crypto";
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const MIN_EDGE = 1600;
const MAX_EDGE = 2400;

export type EnhanceResult = {
  localPath: string;
  publicUrl: string;
  width: number;
  height: number;
  bytes: number;
  sourceUrl: string;
};

/** Prefiere el original sin marca de agua si existe. */
export function preferCleanSourceUrl(url: string): string {
  if (!url.includes("_wm.")) return url;
  return url.replace("_wm.", ".");
}

export function sourceHash(url: string): string {
  return createHash("sha1").update(url).digest("hex").slice(0, 12);
}

export async function downloadImage(url: string): Promise<Buffer> {
  const candidates = [preferCleanSourceUrl(url), url].filter(
    (u, i, arr) => arr.indexOf(u) === i,
  );

  let lastError: unknown;
  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate, {
        headers: { "User-Agent": "SierraInmobiliariaBot/1.0" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1024) throw new Error("Imagen demasiado chica");
      return buf;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("No se pudo descargar la imagen");
}

/**
 * Mejora automática de calidad para publicación:
 * - upscale suave si viene chica
 * - normaliza contraste
 * - satura levemente
 * - nitidez editorial
 * - JPEG/WebP optimizado
 */
export async function enhanceImageBuffer(
  input: Buffer,
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const image = sharp(input, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const longest = Math.max(width, height) || MIN_EDGE;

  let pipeline = sharp(input, { failOn: "none" }).rotate();

  if (longest < MIN_EDGE) {
    const scale = MIN_EDGE / longest;
    pipeline = pipeline.resize({
      width: Math.round(width * scale),
      height: Math.round(height * scale),
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false,
    });
  } else if (longest > MAX_EDGE) {
    pipeline = pipeline.resize({
      width: width >= height ? MAX_EDGE : undefined,
      height: height > width ? MAX_EDGE : undefined,
      fit: "inside",
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: true,
    });
  }

  const buffer = await pipeline
    .normalize({ lower: 2, upper: 98 })
    .modulate({ brightness: 1.03, saturation: 1.1 })
    .sharpen({ sigma: 0.9, m1: 0.8, m2: 0.4 })
    .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: "4:2:0" })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: buffer.data,
    width: buffer.info.width,
    height: buffer.info.height,
  };
}

export async function enhanceAndStorePropertyImage(options: {
  propertyId: string;
  sourceUrl: string;
  index: number;
  publicDir?: string;
}): Promise<EnhanceResult> {
  const publicDir = options.publicDir ?? path.join(process.cwd(), "public");
  const folder = path.join(
    publicDir,
    "properties",
    options.propertyId.toLowerCase(),
  );
  await mkdir(folder, { recursive: true });

  const hash = sourceHash(options.sourceUrl);
  const filename = `${String(options.index + 1).padStart(2, "0")}-${hash}.jpg`;
  const absolute = path.join(folder, filename);
  const publicUrl = `/properties/${options.propertyId.toLowerCase()}/${filename}`;

  try {
    await access(absolute);
    const meta = await sharp(absolute).metadata();
    return {
      localPath: absolute,
      publicUrl,
      width: meta.width ?? 0,
      height: meta.height ?? 0,
      bytes: (await sharp(absolute).toBuffer()).length,
      sourceUrl: options.sourceUrl,
    };
  } catch {
    // continue and create
  }

  const raw = await downloadImage(options.sourceUrl);
  const enhanced = await enhanceImageBuffer(raw);
  await writeFile(absolute, enhanced.buffer);

  return {
    localPath: absolute,
    publicUrl,
    width: enhanced.width,
    height: enhanced.height,
    bytes: enhanced.buffer.length,
    sourceUrl: options.sourceUrl,
  };
}

export async function enhancePropertyImages(options: {
  propertyId: string;
  images: string[];
  publicDir?: string;
  limit?: number;
}): Promise<EnhanceResult[]> {
  const limit = options.limit ?? options.images.length;
  const results: EnhanceResult[] = [];

  for (let i = 0; i < Math.min(options.images.length, limit); i += 1) {
    const sourceUrl = options.images[i];
    if (!sourceUrl) continue;
    // Skip already-local enhanced assets
    if (sourceUrl.startsWith("/properties/")) {
      results.push({
        localPath: path.join(process.cwd(), "public", sourceUrl),
        publicUrl: sourceUrl,
        width: 0,
        height: 0,
        bytes: 0,
        sourceUrl,
      });
      continue;
    }
    results.push(
      await enhanceAndStorePropertyImage({
        propertyId: options.propertyId,
        sourceUrl,
        index: i,
        publicDir: options.publicDir,
      }),
    );
  }

  return results;
}
