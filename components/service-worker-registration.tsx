"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("ServiceWorker registrado com sucesso:", registration);

            // Solicitar permissão para notificações
            if ("Notification" in window) {
              Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                  console.log("Permissão para notificações concedida");
                }
              });
            }
          })
          .catch((error) => {
            console.error("Falha ao registrar ServiceWorker:", error);
          });
      });
    }
  }, []);

  return null;
}
