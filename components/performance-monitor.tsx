"use client";

import { logger } from "@/lib/utils/logger";

import { useEffect } from "react";
import { useReportWebVitals } from "next/web-vitals";

export function PerformanceMonitor() {
  useReportWebVitals((metric) => {
    // Aqui você pode enviar as métricas para seu serviço de analytics
    // Por exemplo: Google Analytics, Vercel Analytics, etc.
    logger.info(metric);

    // Exemplo de implementação com Google Analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", metric.name, {
        value: Math.round(metric.value * 1000) / 1000,
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta,
      });
    }
  });

  useEffect(() => {
    // Monitoramento de performance com Performance API
    if (typeof window !== "undefined" && "PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          logger.info(`${entry.name}: ${entry.duration}`);
        }
      });

      observer.observe({ entryTypes: ["resource", "navigation", "paint"] });

      return () => observer.disconnect();
    }
  }, []);

  return null;
}

