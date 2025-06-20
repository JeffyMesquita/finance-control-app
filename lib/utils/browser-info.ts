import { BrowserInfo } from "@/lib/types/feedback";

// Função utilitária para capturar informações do browser
export function getBrowserInfo(): BrowserInfo {
  if (typeof window === "undefined") {
    return {
      userAgent: "",
      viewport: { width: 0, height: 0 },
      screen: { width: 0, height: 0 },
      language: "",
      platform: "",
      cookieEnabled: false,
    };
  }

  return {
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height,
    },
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
  };
}
