import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// DEVFORGE AI — client build config.
// NOTE: Only variables prefixed VITE_ are exposed to the browser bundle.
// Never prefix secret keys (GEMINI_API_KEY, SUPABASE_SERVICE_ROLE_KEY, etc.) with VITE_.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // In local dev, run `vercel dev` to serve /api, or point this at it.
      "/api": "http://localhost:3000",
    },
  },
  build: {
    target: "es2020",
    sourcemap: true,
  },
});
