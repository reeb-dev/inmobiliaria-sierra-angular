import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, MessageCircle, ShieldCheck, Trees } from "lucide-react";
import { PropertyCard } from "@/components/property-card";
import { agency, properties } from "@/lib/listings";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2000&q=80";

export default function HomePage() {
  const featured = properties.slice(0, 6);

  return (
    <>
      <section className="relative min-h-[92vh] overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt="Sierras al amanecer"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/88 via-forest-deep/55 to-forest-deep/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/70 via-transparent to-forest-deep/20" />

        <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 md:justify-center md:px-6 md:pb-24 md:pt-20">
          <p className="animate-rise font-display text-4xl leading-none text-mist sm:text-5xl md:text-7xl lg:text-8xl">
            Inmobiliaria
            <br />
            Sierra de la Ventana
          </p>
          <p className="animate-rise-delay mt-5 max-w-xl text-base leading-relaxed text-mist/90 md:text-lg">
            {agency.tagline}. Lotes, casas y cabañas en la comarca, con
            asesoramiento local y trato cercano.
          </p>
          <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
            <Link
              href="/propiedades"
              className="inline-flex h-12 items-center gap-2 rounded-md bg-mist px-6 text-base font-medium text-forest-deep transition hover:bg-white"
            >
              Ver propiedades
              <ArrowRight className="size-4" />
            </Link>
            <a
              href={agency.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-md border border-mist/40 bg-white/10 px-6 text-base text-mist backdrop-blur-sm transition hover:bg-white/20"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="sierra-grid pointer-events-none absolute inset-x-0 top-0 h-40 opacity-40" />
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.22em] text-leaf">Destacadas</p>
          <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">
            Propiedades para vivir o invertir en las sierras
          </h2>
          <p className="mt-3 text-ink-soft">
            Selección actual de lotes, casas y cabañas. Filtrá por tipo o zona en
            el catálogo completo.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        <div className="mt-8">
          <Link
            href="/propiedades"
            className="inline-flex items-center gap-2 text-sm font-medium text-forest hover:underline"
          >
            Ver todas las propiedades
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <section className="border-y border-line bg-mist/50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-20">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-leaf">Por qué nosotros</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">
              Conocimiento local, trato humano
            </h2>
            <p className="mt-4 text-ink-soft leading-relaxed">
              {agency.about[0]}
            </p>
            <Link
              href="/nosotros"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-forest hover:underline"
            >
              Conocé la inmobiliaria
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-4">
            {[
              {
                icon: Trees,
                title: "Comarca completa",
                text: "Sierra de la Ventana, Villa Ventana, Saldungaray, Tornquist y alrededores.",
              },
              {
                icon: ShieldCheck,
                title: "Proceso claro",
                text: "Acompañamiento desde la búsqueda hasta el cierre, con transparencia.",
              },
              {
                icon: Leaf,
                title: "Vivir mejor",
                text: "Hogar, refugio o inversión en un entorno de naturaleza real.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-xl border border-line bg-white/50 p-4"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-forest/10 text-forest">
                  <item.icon className="size-5" />
                </div>
                <div>
                  <p className="font-medium text-ink">{item.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="overflow-hidden rounded-3xl bg-forest-deep px-6 py-12 text-mist md:px-12 md:py-14">
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
            <div>
              <p className="font-display text-3xl md:text-5xl">
                ¿Querés vender o saber cuánto vale tu propiedad?
              </p>
              <p className="mt-4 max-w-lg text-mist/80">
                Tasaciones profesionales con lectura del mercado local. Una
                charla sin compromiso para empezar.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                href="/tasaciones"
                className="inline-flex h-12 items-center rounded-md bg-mist px-6 font-medium text-forest-deep"
              >
                Pedir tasación
              </Link>
              <a
                href={agency.phoneHref}
                className="inline-flex h-12 items-center rounded-md border border-mist/35 px-6 text-mist"
              >
                Llamar {agency.phone}
              </a>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 border-t border-white/15 pt-8 md:grid-cols-4">
            {agency.stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-3xl text-sand">{stat.value}</p>
                <p className="mt-1 text-sm text-mist/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
