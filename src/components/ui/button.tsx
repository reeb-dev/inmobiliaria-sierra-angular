import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "light";
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
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition duration-200 disabled:opacity-50",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-5 text-sm",
        size === "lg" && "h-12 px-6 text-base",
        variant === "primary" &&
          "bg-forest text-mist hover:bg-forest-deep shadow-[0_10px_30px_-18px_rgba(19,36,28,0.8)]",
        variant === "secondary" &&
          "border border-line bg-mist/70 text-ink hover:bg-mist",
        variant === "ghost" && "text-ink-soft hover:text-ink hover:bg-mist/50",
        variant === "light" &&
          "bg-mist text-forest-deep hover:bg-white shadow-[0_10px_30px_-18px_rgba(19,36,28,0.8)]",
        className,
      )}
      {...props}
    />
  );
}
