import type { Metadata } from "next";
import { PropertyExplorer } from "@/components/property-explorer";
import { properties } from "@/lib/listings";

export const metadata: Metadata = {
  title: "Propiedades",
  description:
    "Catálogo de lotes, casas y cabañas en Sierra de la Ventana y la comarca.",
};

export default function PropiedadesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.22em] text-leaf">Catálogo</p>
        <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">
          Propiedades en la comarca
        </h1>
        <p className="mt-3 text-ink-soft">
          Buscá por tipo, venta o alquiler, o por zona. Los datos y fotos
          corresponden al inventario público de Inmobiliaria Sierra de la
          Ventana.
        </p>
      </div>
      <div className="mt-10">
        <PropertyExplorer initialProperties={properties} />
      </div>
    </div>
  );
}
