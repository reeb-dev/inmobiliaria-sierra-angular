import Link from "next/link";
import { btn } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.22em] text-leaf">404</p>
      <h1 className="mt-2 font-display text-4xl">No encontramos esa página</h1>
      <p className="mt-3 text-ink-soft">
        Puede que el enlace haya cambiado. Volvé al catálogo o al inicio.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={btn.primarySm}>
          Inicio
        </Link>
        <Link href="/propiedades" className={btn.secondary}>
          Propiedades
        </Link>
      </div>
    </div>
  );
}
