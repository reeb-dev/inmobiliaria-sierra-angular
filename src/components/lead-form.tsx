"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { agency } from "@/lib/listings";

type Mode = "contacto" | "tasacion" | "consulta";

export function LeadForm({
  mode = "contacto",
  propertyTitle,
}: {
  mode?: Mode;
  propertyTitle?: string;
}) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const phone = String(form.get("phone") || "");
    const message = String(form.get("message") || "");
    const address = String(form.get("address") || "");

    const subject =
      mode === "tasacion"
        ? `Pedido de tasación — ${name}`
        : mode === "consulta"
          ? `Consulta por ${propertyTitle ?? "propiedad"} — ${name}`
          : `Consulta web — ${name}`;

    const body = [
      `Nombre: ${name}`,
      `Email: ${email}`,
      `Teléfono: ${phone}`,
      address ? `Dirección: ${address}` : null,
      propertyTitle ? `Propiedad: ${propertyTitle}` : null,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    window.location.href = `mailto:${agency.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 400);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-line bg-mist/80 p-6 text-center md:p-8">
        <CheckCircle2 className="mx-auto size-10 text-leaf" />
        <p className="mt-3 font-display text-2xl">Listo para enviar</p>
        <p className="mt-2 text-sm text-ink-soft">
          Se abrió tu cliente de correo con el mensaje. Si no se abrió, escribinos
          a{" "}
          <a className="text-forest underline" href={`mailto:${agency.email}`}>
            {agency.email}
          </a>{" "}
          o por WhatsApp.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a
            href={agency.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center rounded-md bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-deep"
          >
            Abrir WhatsApp
          </a>
          <Button variant="secondary" type="button" onClick={() => setSent(false)}>
            Enviar otro mensaje
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-line bg-mist/80 p-5 md:p-6"
    >
      <div>
        <p className="font-display text-2xl">
          {mode === "tasacion"
            ? "Solicitar tasación"
            : mode === "consulta"
              ? "Consultar esta propiedad"
              : "Escribinos"}
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          Respondemos de lunes a viernes, 9 a 18 hs.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" name="name" required placeholder="Tu nombre" />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="tu@email.com"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" name="phone" placeholder="Ej: 2916 45-0560" />
        </div>
        {mode === "tasacion" ? (
          <div>
            <Label htmlFor="address">Dirección del inmueble</Label>
            <Input id="address" name="address" placeholder="Calle y localidad" />
          </div>
        ) : (
          <div>
            <Label htmlFor="subject">Asunto</Label>
            <Input
              id="subject"
              name="subject"
              defaultValue={
                propertyTitle ? `Consulta: ${propertyTitle}` : "Consulta general"
              }
            />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="message">Mensaje *</Label>
        <Textarea
          id="message"
          name="message"
          required
          placeholder={
            mode === "tasacion"
              ? "Contanos características del inmueble y para qué necesitás la tasación."
              : "Contanos qué estás buscando o qué te gustaría saber."
          }
        />
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading}>
        {loading ? "Preparando…" : mode === "tasacion" ? "Pedir tasación" : "Enviar consulta"}
      </Button>
    </form>
  );
}
