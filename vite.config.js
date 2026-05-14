import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: "jsx",
    include: /public[/\\]src[/\\].*\.(js|jsx)$/,
    exclude: [],
  },
  root: "public/src",
  build: {
    outDir: "../../dist",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
