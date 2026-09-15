import type { Metadata } from "next";
import Link from "next/link";
import { agency } from "@/lib/listings";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Quiénes somos: inmobiliaria local en Sierra de la Ventana con asesoramiento cercano.",
};

export default function NosotrosPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="max-w-3xl">
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
            className="rounded-2xl border border-line bg-mist/70 p-6"
          >
            <h2 className="font-display text-2xl">{item.title}</h2>
            <p className="mt-2 text-sm text-ink-soft">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/propiedades"
          className="inline-flex h-11 items-center rounded-md bg-forest px-5 text-sm text-mist"
        >
          Ver propiedades
        </Link>
        <Link
          href="/contacto"
          className="inline-flex h-11 items-center rounded-md border border-line bg-mist/80 px-5 text-sm"
        >
          Contactar
        </Link>
      </div>
    </div>
  );
}
