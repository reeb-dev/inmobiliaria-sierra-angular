import { NextResponse } from "next/server";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { enhancePropertyImages } from "@/lib/image-enhance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingProperty = {
  id: string;
  slug?: string;
  title?: string;
  price?: string;
  status?: string;
  type?: string;
  location?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  surface?: string | null;
  description?: string;
  sourceUrl?: string;
  images: string[];
};

/**
 * Publica una propiedad (o re-procesa fotos) y mejora la calidad
 * de cada imagen automáticamente antes de dejarla en el catálogo.
 *
 * POST /api/publish
 * body: { property: IncomingProperty, imageLimit?: number }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      property?: IncomingProperty;
      imageLimit?: number;
    };

    const property = body.property;
    if (!property?.id || !Array.isArray(property.images) || !property.images.length) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Body inválido. Enviá { property: { id, images[] , ... } }",
        },
        { status: 400 },
      );
    }

    const enhanced = await enhancePropertyImages({
      propertyId: property.id,
      images: property.images,
      limit: body.imageLimit ?? property.images.length,
    });

    const nextImages = [
      ...enhanced.map((e) => e.publicUrl),
      ...property.images.slice(enhanced.length),
    ];

    const listingsPath = path.join(process.cwd(), "src/data/listings.json");
    const raw = await readFile(listingsPath, "utf8");
    const data = JSON.parse(raw) as {
      agency: unknown;
      properties: Array<Record<string, unknown> & { id: string; images: string[] }>;
    };

    const index = data.properties.findIndex((p) => p.id === property.id);
    const record = {
      id: property.id,
      slug:
        property.slug ??
        `${property.id.toLowerCase()}-${(property.title ?? "propiedad")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
          .slice(0, 60)}`,
      title: property.title ?? property.id,
      price: property.price ?? "Consultar",
      status: property.status ?? "venta",
      type: property.type ?? "Propiedad",
      location: property.location ?? "Sierra de la Ventana",
      bedrooms: property.bedrooms ?? null,
      bathrooms: property.bathrooms ?? null,
      surface: property.surface ?? null,
      images: nextImages,
      description:
        property.description ??
        "Propiedad en Sierra de la Ventana. Consultá por más detalles.",
      sourceUrl: property.sourceUrl ?? "",
    };

    if (index >= 0) {
      data.properties[index] = { ...data.properties[index], ...record };
    } else {
      data.properties.unshift(record);
    }

    await writeFile(listingsPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");

    return NextResponse.json({
      ok: true,
      propertyId: property.id,
      images: nextImages,
      enhanced: enhanced.map((e) => ({
        url: e.publicUrl,
        width: e.width,
        height: e.height,
        bytes: e.bytes,
      })),
      message:
        "Propiedad publicada con fotos mejoradas automáticamente (nitidez, contraste y tamaño).",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Error al publicar",
      },
      { status: 500 },
    );
  }
}
