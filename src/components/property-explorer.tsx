"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PropertyCard } from "@/components/property-card";
import { Input } from "@/components/ui/field";
import { filterProperties, propertyTypes, type Property } from "@/lib/listings";
import { cn } from "@/lib/utils";

export function PropertyExplorer({
  initialProperties,
  initialStatus = "todos",
}: {
  initialProperties: Property[];
  initialStatus?: string;
}) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("todos");
  const [status, setStatus] = useState(initialStatus);

  const results = useMemo(
    () =>
      filterProperties({
        q,
        type,
        status,
      }).filter((p) => initialProperties.some((ip) => ip.id === p.id)),
    [q, type, status, initialProperties],
  );

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-line bg-mist/70 p-4 shadow-[0_20px_50px_-42px_rgba(19,36,28,0.8)] md:p-5">
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por zona, tipo o código SIE…"
              className="pl-10"
              aria-label="Buscar propiedades"
            />
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-11 rounded-md border border-line bg-mist/80 px-3 text-sm outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/20"
            aria-label="Tipo de propiedad"
          >
            <option value="todos">Todos los tipos</option>
            {propertyTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 rounded-md border border-line bg-mist/80 px-3 text-sm outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/20"
            aria-label="Estado"
          >
            <option value="todos">Venta y alquiler</option>
            <option value="venta">En venta</option>
            <option value="alquiler">En alquiler</option>
          </select>
        </div>
        <p className="mt-3 text-sm text-ink-soft">
          {results.length}{" "}
          {results.length === 1 ? "propiedad encontrada" : "propiedades encontradas"}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-mist/50 px-6 py-16 text-center">
          <p className="font-display text-2xl text-ink">Sin resultados</p>
          <p className="mt-2 text-sm text-ink-soft">
            Probá otra zona, tipo o borrá los filtros. También podés escribirnos
            y te ayudamos a buscar.
          </p>
          <button
            type="button"
            className="mt-5 text-sm font-medium text-forest underline-offset-4 hover:underline"
            onClick={() => {
              setQ("");
              setType("todos");
              setStatus("todos");
            }}
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {results.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
