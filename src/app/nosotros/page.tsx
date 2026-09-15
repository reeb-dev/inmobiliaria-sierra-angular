import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { btn } from "@/components/ui/button";
import { agency } from "@/lib/listings";
import { sierraImages } from "@/lib/images";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Quiénes somos: inmobiliaria local en Sierra de la Ventana con asesoramiento cercano.",
};

export default function NosotrosPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="grid items-end gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-leaf">Nosotros</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">
            Inmobiliaria Sierra de la Ventana
          </h1>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink-soft">
            {agency.about.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
          <Image
            src={sierraImages.ceferino.src}
            alt={sierraImages.ceferino.alt}
            fill
            className="object-cover"
            sizes="(max-width:1024px) 100vw, 40vw"
          />
        </div>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        {[sierraImages.villa, sierraImages.ingreso, sierraImages.arroyo].map(
          (img) => (
            <div
              key={img.src}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl"
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

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Asesoramiento profesional",
            text: "Conocimiento del mercado local para decidir con claridad.",
          },
          {
            title: "Atención personalizada",
            text: "Te guiamos en cada paso hasta encontrar el lugar ideal.",
          },
          {
            title: "Calidad y confianza",
            text: "Relaciones duraderas basadas en cercanía y transparencia.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-line bg-white p-6 shadow-[0_16px_40px_-34px_rgba(19,36,28,0.7)]"
          >
            <h2 className="font-display text-2xl">{item.title}</h2>
            <p className="mt-2 text-sm text-ink-soft">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/propiedades" className={btn.primarySm}>
          Ver propiedades
        </Link>
        <Link href="/contacto" className={btn.secondary}>
          Contactar
        </Link>
      </div>
      <p className="mt-6 text-xs text-ink-soft">
        Paisajes: Wikimedia Commons (Sierra de la Ventana).
      </p>
    </div>
  );
}
