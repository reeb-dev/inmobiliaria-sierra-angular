/**
 * Publica / re-publica propiedades mejorando automáticamente la calidad
 * de cada foto (upscale, contraste, nitidez) y apuntando el catálogo
 * a assets locales optimizados.
 *
 * Uso:
 *   npm run publish:images
 *   npm run publish:images -- --first=3
 *   npm run publish:images -- --id=SIE-232118
 */
import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const MIN_EDGE = 1600;
const MAX_EDGE = 2400;

function preferCleanSourceUrl(url) {
  if (!url.includes("_wm.")) return url;
  return url.replace("_wm.", ".");
}

function sourceHash(url) {
  return createHash("sha1").update(url).digest("hex").slice(0, 12);
}

async function downloadImage(url) {
  const candidates = [preferCleanSourceUrl(url), url].filter(
    (u, i, arr) => arr.indexOf(u) === i,
  );
  let lastError;
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
  throw lastError ?? new Error("No se pudo descargar la imagen");
}

async function enhanceImageBuffer(input) {
  const meta = await sharp(input, { failOn: "none" }).rotate().metadata();
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

  const out = await pipeline
    .normalize({ lower: 2, upper: 98 })
    .modulate({ brightness: 1.03, saturation: 1.1 })
    .sharpen({ sigma: 0.9, m1: 0.8, m2: 0.4 })
    .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: "4:2:0" })
    .toBuffer({ resolveWithObject: true });

  return out;
}

async function enhanceAndStore(propertyId, sourceUrl, index) {
  const folder = path.join(
    process.cwd(),
    "public",
    "properties",
    propertyId.toLowerCase(),
  );
  await mkdir(folder, { recursive: true });
  const hash = sourceHash(sourceUrl);
  const filename = `${String(index + 1).padStart(2, "0")}-${hash}.jpg`;
  const absolute = path.join(folder, filename);
  const publicUrl = `/properties/${propertyId.toLowerCase()}/${filename}`;

  try {
    await access(absolute);
    return publicUrl;
  } catch {
    // create
  }

  const raw = await downloadImage(sourceUrl);
  const enhanced = await enhanceImageBuffer(raw);
  await writeFile(absolute, enhanced.data);
  return publicUrl;
}

async function main() {
  const args = process.argv.slice(2);
  const idArg = args.find((a) => a.startsWith("--id="))?.split("=")[1];
  const perProperty = Number(
    args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? "6",
  );
  const first = args.find((a) => a.startsWith("--first="));
  const firstN = first ? Number(first.split("=")[1]) : null;

  const listingsPath = path.join(process.cwd(), "src/data/listings.json");
  const data = JSON.parse(await readFile(listingsPath, "utf8"));

  let targets = data.properties;
  if (idArg) {
    targets = targets.filter((p) => p.id.toLowerCase() === idArg.toLowerCase());
  }
  if (firstN != null) targets = targets.slice(0, firstN);

  console.log(
    `Mejorando fotos de ${targets.length} propiedades (máx ${perProperty} c/u)...`,
  );

  for (const property of targets) {
    if (!property.images?.length) {
      console.log(`- ${property.id}: sin imágenes`);
      continue;
    }
    try {
      const next = [];
      const count = Math.min(property.images.length, perProperty);
      for (let i = 0; i < count; i += 1) {
        const src = property.images[i];
        if (String(src).startsWith("/properties/")) {
          next.push(src);
          continue;
        }
        next.push(await enhanceAndStore(property.id, src, i));
      }
      // Solo URLs locales: evita saturar /_next/image con el CDN remoto.
      property.images = next;
      console.log(`✓ ${property.id}: ${next.length} fotos locales`);
    } catch (error) {
      console.error(`✗ ${property.id}:`, error.message ?? error);
    }
  }

  await writeFile(listingsPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log("Catálogo actualizado.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
