import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Leaf,
  MessageCircle,
  ShieldCheck,
  Trees,
} from "lucide-react";
import { PropertyCard } from "@/components/property-card";
import { btn } from "@/components/ui/button";
import { agency, properties } from "@/lib/listings";
import { sierraImages } from "@/lib/images";

export default function HomePage() {
  const featured = properties.slice(0, 6);

  return (
    <>
      <section className="relative min-h-[92vh] overflow-hidden">
        <Image
          src={sierraImages.hero.src}
          alt={sierraImages.hero.alt}
          fill
          priority
          className="object-cover object-[center_40%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/90 via-forest-deep/65 to-forest-deep/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 via-transparent to-forest-deep/30" />

        <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 md:justify-center md:px-6 md:pb-24 md:pt-20">
          <p className="animate-rise font-display text-4xl leading-none text-white sm:text-5xl md:text-7xl lg:text-8xl">
            Inmobiliaria
            <br />
            Sierra de la Ventana
          </p>
          <p className="animate-rise-delay mt-5 max-w-xl text-base leading-relaxed text-white/95 md:text-lg">
            {agency.tagline}. Lotes, casas y cabañas en la comarca, con
            asesoramiento local y trato cercano.
          </p>
          <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
            <Link href="/propiedades" className={btn.light}>
              Ver propiedades
              <ArrowRight className="size-4" />
            </Link>
            <a
              href={agency.whatsapp}
              target="_blank"
              rel="noreferrer"
              className={btn.whatsapp}
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
          </div>
          <p className="mt-6 text-[11px] text-white/55">
            Foto: {sierraImages.hero.credit}
          </p>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="sierra-grid pointer-events-none absolute inset-x-0 top-0 h-40 opacity-40" />
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.22em] text-leaf">
            Destacadas
          </p>
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
          <Link href="/propiedades" className={btn.primarySm}>
            Ver todas las propiedades
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <section className="border-y border-line bg-white/40">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-20">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-[0_30px_60px_-40px_rgba(19,36,28,0.7)]">
            <Image
              src={sierraImages.villa.src}
              alt={sierraImages.villa.alt}
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-leaf">
              Por qué nosotros
            </p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">
              Conocimiento local, trato humano
            </h2>
            <p className="mt-4 leading-relaxed text-ink-soft">
              {agency.about[0]}
            </p>
            <div className="mt-6 grid gap-3">
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
                <div key={item.title} className="flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-forest text-white">
                    <item.icon className="size-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-ink">{item.title}</p>
                    <p className="text-sm text-ink-soft">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/nosotros" className={`${btn.primarySm} mt-8`}>
              Conocé la inmobiliaria
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[sierraImages.ceferino, sierraImages.ingreso, sierraImages.arroyo].map(
            (img) => (
              <div
                key={img.src}
                className="relative aspect-[5/4] overflow-hidden rounded-2xl"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width:640px) 100vw, 33vw"
                />
              </div>
            ),
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6 md:pb-20">
        <div className="relative overflow-hidden rounded-3xl px-6 py-12 text-white md:px-12 md:py-14">
          <Image
            src={sierraImages.formaciones.src}
            alt={sierraImages.formaciones.alt}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-forest-deep/88" />
          <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
            <div>
              <p className="font-display text-3xl md:text-5xl">
                ¿Querés vender o saber cuánto vale tu propiedad?
              </p>
              <p className="mt-4 max-w-lg text-white/85">
                Tasaciones profesionales con lectura del mercado local. Una
                charla sin compromiso para empezar.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link href="/tasaciones" className={btn.light}>
                Pedir tasación
              </Link>
              <a href={agency.phoneHref} className={btn.light}>
                Llamar {agency.phone}
              </a>
            </div>
          </div>
          <div className="relative mt-10 grid grid-cols-2 gap-4 border-t border-white/20 pt-8 md:grid-cols-4">
            {agency.stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-3xl text-sand">{stat.value}</p>
                <p className="mt-1 text-sm text-white/75">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
