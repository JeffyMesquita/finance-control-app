import { apiRequest } from "./client";
import type { ApiSession } from "./contracts";

export const sessionApi = {
  getCurrentUser: () => apiRequest<ApiSession>("/auth/me"),
  login: (input: { email: string; password: string; recaptchaToken: string }) =>
    apiRequest<{ requiresEmailConfirmation: boolean }>("/auth/login", {
      body: input,
      method: "POST",
    }),
  register: (input: {
    email: string;
    password: string;
    recaptchaToken: string;
    referralId?: string;
  }) =>
    apiRequest<{ requiresEmailConfirmation: boolean }>("/auth/register", {
      body: input,
      method: "POST",
    }),
  logout: () => apiRequest<void>("/auth/logout", { method: "POST" }),
  prepareGoogleLogin: (input: { recaptchaToken: string; referralId?: string }) =>
    apiRequest<void>("/auth/google/prepare", {
      body: input,
      method: "POST",
    }),
  googleLoginUrl: (referralId?: string) => {
    const query = referralId ? `?referralId=${encodeURIComponent(referralId)}` : "";
    return `/api/backend/auth/google${query}`;
  },
};
