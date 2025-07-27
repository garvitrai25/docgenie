// docgeniee 2/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async () => ({
  root: path.resolve(__dirname, "client"),
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [(await import("@replit/vite-plugin-cartographer")).cartographer()]
      : []),
  ],
  resolve: {
    alias: {
      // THIS IS THE LINE YOU NEED TO CHANGE/CONFIRM!
      // It should be "src" (relative to the 'client' root), not an absolute path.
      "@": "src", // <--- ENSURE THIS LINE IS EXACTLY "src"
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    },
    historyApiFallback: true,
    proxy: {
      "/api": "http://localhost:5001"
    }
  }
}));