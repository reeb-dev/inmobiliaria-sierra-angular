"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { agency } from "@/lib/listings";
import { cn } from "@/lib/utils";

const links = [
  { href: "/propiedades", label: "Propiedades" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/tasaciones", label: "Tasaciones" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-mist/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="group min-w-0" onClick={() => setOpen(false)}>
          <p className="font-display text-xl leading-none tracking-tight text-forest-deep md:text-2xl">
            Sierra de la Ventana
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-ink-soft">
            Inmobiliaria
          </p>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm transition",
                pathname.startsWith(link.href)
                  ? "bg-forest/10 text-forest-deep"
                  : "text-ink-soft hover:bg-mist hover:text-ink",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={agency.phoneHref}
            className="hidden items-center gap-2 rounded-md border border-line bg-mist/80 px-3 py-2 text-sm text-forest-deep transition hover:bg-white sm:inline-flex"
          >
            <Phone className="size-4" />
            {agency.phone}
          </a>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-md border border-line bg-mist/80 md:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-line bg-mist px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-3 text-base",
                  pathname.startsWith(link.href)
                    ? "bg-forest/10 text-forest-deep"
                    : "text-ink-soft",
                )}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={agency.phoneHref}
              className="mt-2 inline-flex items-center gap-2 rounded-md bg-forest px-3 py-3 text-mist"
            >
              <Phone className="size-4" />
              Llamar {agency.phone}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
