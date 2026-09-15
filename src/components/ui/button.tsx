import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "light" | "outlineOnDark";
  size?: "md" | "lg" | "sm";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition duration-200 disabled:opacity-50",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-5 text-sm",
        size === "lg" && "h-12 px-6 text-base",
        variant === "primary" &&
          "bg-forest text-white shadow-[0_12px_28px_-16px_rgba(19,36,28,0.85)] hover:bg-forest-deep",
        variant === "secondary" &&
          "border-2 border-forest bg-white text-forest hover:bg-mist",
        variant === "ghost" &&
          "text-forest underline-offset-4 hover:bg-forest/5 hover:underline",
        variant === "light" &&
          "bg-white text-forest-deep shadow-[0_12px_28px_-16px_rgba(19,36,28,0.85)] hover:bg-glow",
        variant === "outlineOnDark" &&
          "border-2 border-white bg-white/20 text-white backdrop-blur-sm hover:bg-white hover:text-forest-deep",
        className,
      )}
      {...props}
    />
  );
}

/** Clases para Links / anchors con look de botón (alto contraste). */
export const btn = {
  primary:
    "inline-flex h-12 items-center justify-center gap-2 rounded-md bg-forest px-6 text-base font-semibold text-white shadow-[0_12px_28px_-16px_rgba(19,36,28,0.85)] transition hover:bg-forest-deep",
  primarySm:
    "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-forest px-5 text-sm font-semibold text-white transition hover:bg-forest-deep",
  secondary:
    "inline-flex h-11 items-center justify-center gap-2 rounded-md border-2 border-forest bg-white px-5 text-sm font-semibold text-forest transition hover:bg-mist",
  light:
    "inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-6 text-base font-semibold text-forest-deep shadow-[0_12px_28px_-16px_rgba(19,36,28,0.85)] transition hover:bg-glow",
  outlineOnDark:
    "inline-flex h-12 items-center justify-center gap-2 rounded-md border-2 border-white bg-white px-6 text-base font-semibold text-forest-deep shadow-[0_12px_28px_-16px_rgba(19,36,28,0.85)] transition hover:bg-glow",
  whatsapp:
    "inline-flex h-12 items-center justify-center gap-2 rounded-md border-2 border-white bg-[#25D366] px-6 text-base font-bold text-white shadow-[0_14px_32px_-12px_rgba(0,0,0,0.55)] ring-2 ring-white/80 transition hover:bg-[#1EBE57]",
  phone:
    "inline-flex items-center gap-2 rounded-md bg-forest px-3 py-2 text-sm font-semibold text-white transition hover:bg-forest-deep",
} as const;
