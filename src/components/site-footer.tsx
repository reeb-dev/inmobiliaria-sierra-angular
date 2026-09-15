import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { agency } from "@/lib/listings";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-forest-deep text-mist">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-6">
        <div>
          <p className="font-display text-3xl tracking-tight">
            Inmobiliaria Sierra de la Ventana
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-mist/80">
            Te acompañamos a encontrar tu hogar, tu refugio o tu próxima
            inversión en un entorno único. Compromiso, transparencia y atención
            cercana.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-sand">Explorar</p>
          <ul className="mt-4 space-y-2 text-sm text-mist/85">
            <li>
              <Link href="/propiedades" className="hover:text-white">
                Propiedades
              </Link>
            </li>
            <li>
              <Link href="/tasaciones" className="hover:text-white">
                Pedir tasación
              </Link>
            </li>
            <li>
              <Link href="/nosotros" className="hover:text-white">
                Nosotros
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="hover:text-white">
                Contacto
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-sand">Contacto</p>
          <ul className="mt-4 space-y-3 text-sm text-mist/85">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {agency.address}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" />
              <a href={agency.phoneHref} className="hover:text-white">
                {agency.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" />
              <a href={`mailto:${agency.email}`} className="hover:text-white">
                {agency.email}
              </a>
            </li>
            <li className="text-mist/70">{agency.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-mist/60 md:px-6">
        Rediseño demo con información pública de {agency.name}. No es el sitio
        oficial.
      </div>
    </footer>
  );
}
