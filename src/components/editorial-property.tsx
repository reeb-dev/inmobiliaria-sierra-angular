import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bath, BedDouble, MapPin, Maximize2 } from "lucide-react";
import { btn } from "@/components/ui/button";
import type { Property } from "@/lib/listings";
import { cn, formatSurface } from "@/lib/utils";

export function EditorialProperty({
  property,
  reverse = false,
}: {
  property: Property;
  reverse?: boolean;
}) {
  const image = property.images[0];
  const surface = formatSurface(property.surface);

  return (
    <article
      className={cn(
        "grid items-center gap-6 md:grid-cols-2 md:gap-10",
        reverse && "md:[&>*:first-child]:order-2",
      )}
    >
      <Link
        href={`/propiedades/${property.slug}`}
        className="group relative aspect-[5/4] overflow-hidden rounded-3xl md:aspect-[4/3]"
      >
        {image ? (
          <Image
            src={image}
            alt={property.title}
            fill
            quality={90}
            sizes="(max-width:768px) 100vw, 50vw"
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-80" />
        <span className="absolute left-4 top-4 rounded-md bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-forest-deep">
          {property.type}
        </span>
      </Link>

      <div className="px-1 md:px-2">
        <p className="text-xs uppercase tracking-[0.22em] text-leaf">
          {property.status === "alquiler" ? "Alquiler" : "En venta"}
        </p>
        <h3 className="mt-2 font-display text-3xl leading-tight text-ink md:text-4xl">
          {property.title}
        </h3>
        <p className="mt-3 font-display text-2xl text-forest">{property.price}</p>
        <p className="mt-3 flex items-start gap-2 text-ink-soft">
          <MapPin className="mt-0.5 size-4 shrink-0" />
          {property.location}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-soft">
          {property.bedrooms != null ? (
            <span className="inline-flex items-center gap-1.5">
              <BedDouble className="size-4 text-leaf" />
              {property.bedrooms} dorm.
            </span>
          ) : null}
          {property.bathrooms != null ? (
            <span className="inline-flex items-center gap-1.5">
              <Bath className="size-4 text-leaf" />
              {property.bathrooms} baños
            </span>
          ) : null}
          {surface ? (
            <span className="inline-flex items-center gap-1.5">
              <Maximize2 className="size-4 text-leaf" />
              {surface}
            </span>
          ) : null}
        </div>
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-ink-soft">
          {property.description}
        </p>
        <Link
          href={`/propiedades/${property.slug}`}
          className={`${btn.primarySm} mt-6`}
        >
          Ver ficha
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}
