import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { agency } from "@/lib/listings";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contactá a Inmobiliaria Sierra de la Ventana.",
};

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.22em] text-leaf">Contacto</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Estamos para ayudarte</h1>
        <p className="mt-3 text-ink-soft">
          Vender y comprar puede ser estresante. Llamá o escribinos para una
          charla sin compromiso y consejos útiles sobre tu próxima operación.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-mist/70 p-5">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Phone className="size-4 text-leaf" />
              Teléfono
            </p>
            <a href={agency.phoneHref} className="mt-2 block text-lg text-forest">
              {agency.phone}
            </a>
          </div>
          <div className="rounded-2xl border border-line bg-mist/70 p-5">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Mail className="size-4 text-leaf" />
              Email
            </p>
            <a
              href={`mailto:${agency.email}`}
              className="mt-2 block break-all text-lg text-forest"
            >
              {agency.email}
            </a>
          </div>
          <div className="rounded-2xl border border-line bg-mist/70 p-5">
            <p className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="size-4 text-leaf" />
              Ubicación y horarios
            </p>
            <p className="mt-2 text-ink-soft">{agency.address}</p>
            <p className="mt-1 text-sm text-ink-soft">{agency.hours}</p>
          </div>
        </div>
        <LeadForm mode="contacto" />
      </div>
    </div>
  );
}
