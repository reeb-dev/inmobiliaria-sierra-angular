import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSurface(surface: string | number | null | undefined) {
  if (surface === null || surface === undefined || surface === "") return null;
  const raw = String(surface).replace(",", ".");
  const n = Number.parseFloat(raw);
  if (Number.isNaN(n)) return `${surface} m²`;
  return `${Math.round(n).toLocaleString("es-AR")} m²`;
}
