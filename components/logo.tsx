import type React from "react";
import { cn } from "@/lib/utils";

type LogoProps = Omit<React.SVGProps<SVGSVGElement>, "aria-label"> & {
  dark?: boolean;
  light?: boolean;
};

export function Logo({ className, dark, light, ...props }: LogoProps) {
  const textColor = light ? "#F7F8F4" : dark ? "#162019" : "currentColor";

  return (
    <svg
      aria-label="AjeitaGrana"
      className={cn("h-9 w-auto", className)}
      fill="none"
      role="img"
      viewBox="0 0 212 48"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 38 24 8l12 30M17 28h14"
        stroke="#047857"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      />
      <path d="M36 30c9 8 18 7 27-4" stroke="#047857" strokeLinecap="round" strokeWidth="4" />
      <text
        fill={textColor}
        fontFamily="Geist, Arial, sans-serif"
        fontSize="25"
        fontWeight="650"
        letterSpacing="-1.2"
        x="72"
        y="32"
      >
        AjeitaGrana
      </text>
    </svg>
  );
}
