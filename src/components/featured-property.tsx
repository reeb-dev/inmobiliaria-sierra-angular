import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { btn } from "@/components/ui/button";
import { agency, type Property } from "@/lib/listings";

export function FeaturedProperty({ property }: { property: Property }) {
  const image = property.images[0];
  const waText = encodeURIComponent(
    `Hola, me interesa la propiedad ${property.id}: ${property.title}`,
  );

  return (
    <section className="relative min-h-[78vh] overflow-hidden md:min-h-[85vh]">
      {image ? (
        <Image
          src={image}
          alt={property.title}
          fill
          priority
          unoptimized={image.startsWith("/")}
          quality={90}
          className="object-cover"
          sizes="100vw"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

      <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 pb-14 pt-28 md:min-h-[85vh] md:px-6 md:pb-20">
        <p className="text-xs uppercase tracking-[0.24em] text-sand">
          Destacada · {property.type}
        </p>
        <h2 className="mt-3 max-w-3xl font-display text-4xl leading-[0.95] text-white md:text-6xl lg:text-7xl">
          {property.title}
        </h2>
        <p className="mt-4 flex items-center gap-2 text-white/80">
          <MapPin className="size-4" />
          {property.location}
        </p>
        <p className="mt-4 font-display text-3xl text-white md:text-4xl">
          {property.price}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/propiedades/${property.slug}`} className={btn.light}>
            Ver esta propiedad
            <ArrowRight className="size-4" />
          </Link>
          <a
            href={`${agency.whatsapp}?text=${waText}`}
            target="_blank"
            rel="noreferrer"
            className={btn.whatsapp}
          >
            <MessageCircle className="size-4" />
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
