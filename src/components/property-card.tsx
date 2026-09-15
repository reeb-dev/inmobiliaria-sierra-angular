import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bath, BedDouble, MapPin, Maximize2 } from "lucide-react";
import type { Property } from "@/lib/listings";
import { formatSurface } from "@/lib/utils";

export function PropertyCard({ property }: { property: Property }) {
  const image = property.images[0];
  const surface = formatSurface(property.surface);

  return (
    <article className="group relative isolate overflow-hidden rounded-2xl bg-forest-deep shadow-[0_24px_60px_-36px_rgba(19,36,28,0.75)]">
      <Link href={`/propiedades/${property.slug}`} className="block">
        <div className="relative aspect-[4/5] sm:aspect-[5/6]">
          {image ? (
            <Image
              src={image}
              alt={property.title}
              fill
              sizes="(max-width:768px) 100vw, 33vw"
              quality={90}
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-bg-deep text-sm text-ink-soft">
              Sin imagen
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />

          <div className="absolute left-3 top-3 flex gap-2">
            <span className="rounded-md bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-forest-deep">
              {property.status === "alquiler" ? "Alquiler" : "Venta"}
            </span>
            <span className="rounded-md bg-black/45 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              {property.type}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
            <p className="font-display text-2xl text-white md:text-3xl">
              {property.price}
            </p>
            <h3 className="mt-1 line-clamp-2 font-display text-lg leading-snug text-white/95">
              {property.title}
            </h3>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-white/75">
              <MapPin className="size-3.5 shrink-0" />
              <span className="line-clamp-1">{property.location}</span>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/70">
              {property.bedrooms != null ? (
                <span className="inline-flex items-center gap-1">
                  <BedDouble className="size-3.5" />
                  {property.bedrooms}
                </span>
              ) : null}
              {property.bathrooms != null ? (
                <span className="inline-flex items-center gap-1">
                  <Bath className="size-3.5" />
                  {property.bathrooms}
                </span>
              ) : null}
              {surface ? (
                <span className="inline-flex items-center gap-1">
                  <Maximize2 className="size-3.5" />
                  {surface}
                </span>
              ) : null}
              <span className="ml-auto inline-flex items-center gap-1 font-medium text-white opacity-0 transition group-hover:opacity-100">
                Ver ficha
                <ArrowUpRight className="size-3.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
