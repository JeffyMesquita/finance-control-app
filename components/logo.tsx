"use client";

import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type LogoProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  className?: string;
  light?: boolean;
  dark?: boolean;
  width?: number;
  height?: number;
};

export function Logo({
  light = false,
  dark = false,
  className,
  width,
  height,
  ...props
}: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  let src = "/logo-dark.png";
  if (mounted) {
    src = light
      ? "/logo-light.png"
      : dark
      ? "/logo-dark.png"
      : resolvedTheme === "dark"
      ? "/logo-dark.png"
      : "/logo-light.png";
  }

  return (
    <Image
      src={src}
      alt="FinanceTrack"
      className={cn("h-8 w-auto", className)}
      width={width || 32}
      height={height || 32}
      {...props}
    />
  );
}
