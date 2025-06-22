"use client";

import { logger } from "@/lib/utils/logger";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            logger.info("ServiceWorker registrado com sucesso:", {
              data: registration,
            });

            // Solicitar permissão para notificações
            if ("Notification" in window) {
              Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                  logger.info("Permissão para notificações concedida");
                }
              });
            }
          })
          .catch((error) => {
            logger.error("Falha ao registrar ServiceWorker:", error);
          });
      });
    }
  }, []);

  return null;
}
