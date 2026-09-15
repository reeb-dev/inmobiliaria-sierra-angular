import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bath,
  BedDouble,
  ExternalLink,
  MapPin,
  Maximize2,
  MessageCircle,
  Phone,
} from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { PropertyCard } from "@/components/property-card";
import { PropertyGallery } from "@/components/property-gallery";
import { btn } from "@/components/ui/button";
import {
  agency,
  getPropertyBySlug,
  getRelatedProperties,
  properties,
} from "@/lib/listings";
import { formatSurface } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  if (!property) return { title: "Propiedad" };
  return {
    title: property.title,
    description: property.description.slice(0, 155),
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  if (!property) notFound();

  const related = getRelatedProperties(property);
  const surface = formatSurface(property.surface);
  const waText = encodeURIComponent(
    `Hola, me interesa la propiedad ${property.id}: ${property.title}`,
  );
  const lead = property.description.split(/(?<=\.)\s+/)[0] ?? property.description;
  const rest = property.description.slice(lead.length).trim();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <nav className="mb-6 text-sm text-ink-soft">
        <Link href="/propiedades" className="hover:text-ink">
          Propiedades
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{property.id}</span>
      </nav>

      <PropertyGallery images={property.images} title={property.title} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.45fr_0.85fr]">
        <div className="space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-forest px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                {property.status === "alquiler" ? "Alquiler" : "Venta"}
              </span>
              <span className="rounded-md border border-line bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                {property.type}
              </span>
            </div>
            <h1 className="mt-4 font-display text-3xl leading-[1.05] text-ink md:text-5xl">
              {property.title}
            </h1>
            <p className="mt-3 flex items-start gap-2 text-ink-soft">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {property.location}
            </p>
            <p className="mt-5 font-display text-3xl text-forest md:text-4xl">
              {property.price}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 rounded-2xl border border-line bg-white/70 p-4">
            {property.bedrooms != null ? (
              <div className="flex items-center gap-2 text-sm">
                <BedDouble className="size-4 text-leaf" />
                {property.bedrooms} dormitorios
              </div>
            ) : null}
            {property.bathrooms != null ? (
              <div className="flex items-center gap-2 text-sm">
                <Bath className="size-4 text-leaf" />
                {property.bathrooms} baños
              </div>
            ) : null}
            {surface ? (
              <div className="flex items-center gap-2 text-sm">
                <Maximize2 className="size-4 text-leaf" />
                {surface}
              </div>
            ) : null}
            <div className="text-sm text-ink-soft">Código {property.id}</div>
          </div>

          <div>
            <h2 className="font-display text-2xl">Descripción</h2>
            <p className="mt-4 font-display text-xl leading-snug text-ink md:text-2xl">
              {lead}
            </p>
            {rest ? (
              <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-ink-soft">
                {rest}
              </p>
            ) : null}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-line bg-white p-5 shadow-[0_24px_50px_-36px_rgba(19,36,28,0.55)]">
            <p className="text-xs uppercase tracking-[0.2em] text-leaf">
              Consulta rápida
            </p>
            <p className="mt-2 font-display text-3xl text-forest">
              {property.price}
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Respondemos por WhatsApp o teléfono en el día.
            </p>
            <div className="mt-5 grid gap-2">
              <a
                href={`${agency.whatsapp}?text=${waText}`}
                target="_blank"
                rel="noreferrer"
                className={`${btn.whatsapp} w-full`}
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
              <a href={agency.phoneHref} className={`${btn.secondary} w-full`}>
                <Phone className="size-4" />
                {agency.phone}
              </a>
              <a
                href={property.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 text-sm font-medium text-forest underline-offset-4 hover:underline"
              >
                Ver ficha original
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
          <LeadForm mode="consulta" propertyTitle={property.title} />
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-display text-3xl">También en la comarca</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
