import { apiRequest } from "./client";
import type { ApiSession } from "./contracts";

export const sessionApi = {
  getCurrentUser: () => apiRequest<ApiSession>("/auth/me"),
  loginWithEmail: (input: {
    email: string;
    password: string;
    recaptchaToken: string;
    isRegister: boolean;
  }) =>
    apiRequest<{ requiresEmailConfirmation: boolean }>("/auth/email", {
      body: input,
      method: "POST",
    }),
  logout: () => apiRequest<void>("/auth/logout", { method: "POST" }),
  googleLoginUrl: "/api/backend/auth/google",
};
