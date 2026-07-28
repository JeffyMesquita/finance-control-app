import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
  test: {
    clearMocks: true,
    environment: "jsdom",
    exclude: [
      "**/node_modules/**",
      "**/.pnpm-store/**",
      "**/.next/**",
      "**/playwright/**",
      "**/e2e/**",
    ],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    restoreMocks: true,
    setupFiles: ["./test/setup.ts"],
  },
});
