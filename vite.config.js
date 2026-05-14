import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react({ include: "**/*.{js,jsx}" })],
  root: "public/src",
  build: {
    outDir: "../../dist",
    emptyOutDir: true,
  },
  esbuild: {
    loader: "jsx",
    include: /public[/\\]src[/\\].*\.js$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { ".js": "jsx" },
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
