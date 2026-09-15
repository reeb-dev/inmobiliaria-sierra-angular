import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, MapPin, Maximize2 } from "lucide-react";
import type { Property } from "@/lib/listings";
import { formatSurface } from "@/lib/utils";

export function PropertyCard({ property }: { property: Property }) {
  const image = property.images[0];
  const surface = formatSurface(property.surface);

  return (
    <article className="group overflow-hidden rounded-xl border border-line/80 bg-mist/60 shadow-[0_20px_50px_-40px_rgba(19,36,28,0.7)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-36px_rgba(19,36,28,0.75)]">
      <Link href={`/propiedades/${property.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-bg-deep">
          {image ? (
            <Image
              src={image}
              alt={property.title}
              fill
              sizes="(max-width:768px) 100vw, 33vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-ink-soft">
              Sin imagen
            </div>
          )}
          <div className="absolute left-3 top-3 flex gap-2">
            <span className="rounded-md bg-forest-deep/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              {property.status === "alquiler" ? "Alquiler" : "Venta"}
            </span>
            <span className="rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-forest-deep">
              {property.type}
            </span>
          </div>
        </div>
        <div className="space-y-3 p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-xl leading-snug text-ink">
              {property.title}
            </h3>
            <p className="shrink-0 text-sm font-semibold text-forest">
              {property.price}
            </p>
          </div>
          <p className="flex items-start gap-1.5 text-sm text-ink-soft">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            {property.location}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-ink-soft">
            {property.bedrooms != null ? (
              <span className="inline-flex items-center gap-1">
                <BedDouble className="size-3.5" />
                {property.bedrooms} dorm.
              </span>
            ) : null}
            {property.bathrooms != null ? (
              <span className="inline-flex items-center gap-1">
                <Bath className="size-3.5" />
                {property.bathrooms} baños
              </span>
            ) : null}
            {surface ? (
              <span className="inline-flex items-center gap-1">
                <Maximize2 className="size-3.5" />
                {surface}
              </span>
            ) : null}
            <span className="ml-auto text-[11px] uppercase tracking-wider">
              {property.id}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
