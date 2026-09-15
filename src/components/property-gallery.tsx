"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function PropertyGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!images.length) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-bg-deep text-ink-soft">
        Sin imágenes disponibles
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-bg-deep">
        <Image
          key={current}
          src={current}
          alt={`${title} — foto ${active + 1}`}
          fill
          priority
          sizes="(max-width:1024px) 100vw, 66vw"
          className="animate-fade object-cover"
        />
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-md border transition",
                i === active
                  ? "border-forest ring-2 ring-forest/30"
                  : "border-line opacity-80 hover:opacity-100",
              )}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="96px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
