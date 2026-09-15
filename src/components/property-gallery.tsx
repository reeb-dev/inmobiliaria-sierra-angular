"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function PropertyGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft")
        setActive((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, images.length]);

  if (!images.length) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-3xl bg-bg-deep text-ink-soft">
        Sin imágenes disponibles
      </div>
    );
  }

  const main = images[0];
  const side = images.slice(1, 5);

  return (
    <>
      <div className="grid gap-2 md:grid-cols-[1.4fr_0.8fr] md:gap-3">
        <button
          type="button"
          onClick={() => {
            setActive(0);
            setOpen(true);
          }}
          className="relative aspect-[16/11] overflow-hidden rounded-3xl bg-bg-deep md:aspect-auto md:min-h-[420px]"
        >
          <Image
            src={main}
            alt={`${title} — foto principal`}
            fill
            priority
            quality={90}
            sizes="(max-width:768px) 100vw, 60vw"
            className="object-cover transition duration-500 hover:scale-[1.02]"
          />
          <span className="absolute bottom-3 left-3 rounded-md bg-black/55 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
            Ver galería
          </span>
        </button>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-1 md:grid-rows-2 md:gap-3">
          {(side.length ? side : [main, main]).slice(0, 4).map((src, i) => {
            const index = side.length ? i + 1 : 0;
            return (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => {
                  setActive(index);
                  setOpen(true);
                }}
                className={cn(
                  "relative overflow-hidden rounded-2xl bg-bg-deep",
                  i === 0 ? "aspect-[4/3] md:aspect-auto md:min-h-[204px]" : "aspect-[4/3] md:min-h-[204px]",
                  i > 1 && side.length <= 2 ? "hidden md:block" : "",
                )}
              >
                <Image
                  src={src}
                  alt={`${title} — foto ${index + 1}`}
                  fill
                  sizes="(max-width:768px) 50vw, 30vw"
                  className="object-cover transition duration-500 hover:scale-[1.03]"
                />
                {i === 3 && images.length > 5 ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">
                    +{images.length - 5} fotos
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/92 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Galería de fotos"
        >
          <button
            type="button"
            className="absolute right-4 top-4 inline-flex size-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
          <div className="relative h-[70vh] w-full max-w-5xl">
            <Image
              src={images[active]}
              alt={`${title} — foto ${active + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
          <div className="absolute bottom-6 left-1/2 flex max-w-[90vw] -translate-x-1/2 gap-2 overflow-x-auto">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "relative h-14 w-20 shrink-0 overflow-hidden rounded-md border-2",
                  i === active ? "border-white" : "border-transparent opacity-70",
                )}
              >
                <Image src={src} alt="" fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
