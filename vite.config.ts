import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

// __dirname is not directly available in ES modules, so we derive it.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async () => ({
  // Set the root of the Vite project to the 'client' directory.
  // This means all relative paths in Vite's configuration will be resolved from 'client/'.
  root: path.resolve(__dirname, "client"),

  plugins: [
    react(), // React plugin for Vite, enabling React features like JSX.
    runtimeErrorOverlay(), // Replit-specific plugin for displaying runtime errors.
    // Conditionally include Replit's cartographer plugin only in development and when REPL_ID is defined.
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [(await import("@replit/vite-plugin-cartographer")).cartographer()]
      : []),
  ],

  resolve: {
    alias: {
      // ** THIS IS THE CRITICAL CHANGE **
      // When 'root' is set to 'client/', '@' should point to 'src' directly within the 'client' directory.
      "@": "src", // Change this line from path.resolve(__dirname, "client/src") to "src"
      // Aliases for directories outside the 'client' root still need full absolute paths.
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },

  build: {
    // Output directory for the production build.
    // It's set to 'dist/public' relative to the project root (where package.json is).
    outDir: path.resolve(__dirname, "dist/public"),
    // Clears the output directory before building.
    emptyOutDir: true,
  },

  server: {
    // Restricts file system access to prevent serving arbitrary files.
    fs: {
      strict: true,
      deny: ["**/.*"] // Deny access to dotfiles (e.g., .env, .git)
    },
    // Enables history API fallback for client-side routing.
    historyApiFallback: true,
    // Proxy API requests to the backend server.
    // Requests starting with '/api' will be forwarded to 'http://localhost:5001'.
    proxy: {
      "/api": "http://localhost:5001"
    }
  }
}));