import type { Metadata } from "next";
import { LeadForm } from "@/components/lead-form";

export const metadata: Metadata = {
  title: "Tasaciones",
  description:
    "Solicitá una tasación profesional en Sierra de la Ventana y la comarca.",
};

export default function TasacionesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-leaf">
            Tasaciones
          </p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">
            Tasaciones profesionales
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
            Realizamos tasaciones elaboradas por un equipo que estudia el
            mercado local y analiza el contexto para sacar el mayor rédito a tu
            próxima operación inmobiliaria.
          </p>
          <p className="mt-4 max-w-xl text-ink-soft">
            Un profesional de la inmobiliaria se comunica para asesorarte. Sin
            compromiso: el primer paso es contar qué querés valorar.
          </p>
        </div>
        <LeadForm mode="tasacion" />
      </div>
    </div>
  );
}
