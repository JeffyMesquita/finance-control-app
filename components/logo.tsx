import Image from "next/image";
import type React from "react";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

type LogoProps = React.HTMLAttributes<HTMLSpanElement> & {
  dark?: boolean;
  light?: boolean;
  compact?: boolean;
};

export function Logo({ className, dark, light, compact = false, ...props }: LogoProps) {
  const foreground = light ? "#F7F8F4" : dark ? "#162019" : "currentColor";

  return (
    <span
      aria-label="AjeitaGrana"
      className={cn("inline-flex h-9 w-fit items-center gap-2", className)}
      role="img"
      {...props}
    >
      <Image
        src={brand.assets.symbol}
        alt=""
        aria-hidden="true"
        className="h-full w-auto shrink-0 object-contain"
        height={512}
        priority
        width={512}
      />
      {!compact && (
        <span
          className="whitespace-nowrap text-[1.1em] font-semibold tracking-[-0.055em]"
          style={{ color: foreground }}
        >
          AjeitaGrana
        </span>
      )}
    </span>
  );
}
