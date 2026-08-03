import type React from "react";
import { cn } from "@/lib/utils";

type LogoProps = React.HTMLAttributes<HTMLSpanElement> & {
  dark?: boolean;
  light?: boolean;
  compact?: boolean;
};

/** The AjeitaGrana mark: a geometric A with an emerald progress path. */
export function Logo({ className, dark, light, compact = false, ...props }: LogoProps) {
  const foreground = light ? "#F7F8F4" : dark ? "#162019" : "currentColor";

  return (
    <span
      aria-label="AjeitaGrana"
      className={cn("inline-flex h-9 w-fit items-center gap-2", className)}
      role="img"
      {...props}
    >
      <svg
        aria-hidden="true"
        className="h-full w-auto shrink-0"
        fill="none"
        viewBox="0 0 56 48"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 40 21.1 7.3c.9-1.8 3.4-1.8 4.3 0L42 40M13 28h20"
          stroke={foreground}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="5.2"
        />
        <path
          d="M5 39c9.2-3.2 16.2.4 23.2-7.1C34.1 25.6 39 17.1 50.2 14"
          stroke="#047857"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4.2"
        />
        <circle cx="50" cy="14" fill="#047857" r="2.2" />
      </svg>
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
