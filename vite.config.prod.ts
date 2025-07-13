import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// Production-optimized config for Render deployment
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Minimal configuration to reduce memory usage
    target: "es2015",
    minify: "esbuild", // Faster than terser
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
        },
      },
    },
  },
  // Disable optimizations that use more memory
  optimizeDeps: {
    disabled: true,
  },
  // Reduce memory usage
  esbuild: {
    drop: ["console", "debugger"],
  },
});
