import * as LucideIcons from "lucide-react";
import React from "react";
import { logger } from "@/lib/utils/logger";

export type LucideIcon = keyof typeof LucideIcons;

interface DynamicIconProps {
  icon: LucideIcon;
  size?: number;
  color?: string;
  className?: string;
}

export function DynamicIcon({
  icon,
  size = 20,
  color,
  className,
}: DynamicIconProps) {
  const IconComponent = LucideIcons[icon];

  const renderIcon = () => {
    if (!IconComponent) {
      logger.warn(`Icon "${icon}" not found in LucideIcons`);
      return null;
    }
    const Icon = IconComponent as React.ComponentType<{
      size?: number;
      color?: string;
      className?: string;
    }>;
    return <Icon size={size} color={color} className={className} />;
  };

  return <>{renderIcon()}</>;
}
