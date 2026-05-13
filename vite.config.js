import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // CHANGED: tell the React plugin to also process plain `.js` files so we can use JSX in them.
  plugins: [react({ include: "**/*.{js,jsx}" })],
  // CHANGED: the existing `index.html` lives in `public/src/`, so point Vite there.
  root: "public/src",
  // CHANGED: Vercel's static-build looks for build output in `dist/` at the project root,
  // and because `root` is `public/src` we have to step up two levels.
  build: {
    outDir: "../../dist",
    emptyOutDir: true,
  },
  // CHANGED: allow JSX syntax inside `.js` files (otherwise the bundler errors on `<App />` etc.).
  esbuild: {
    loader: "jsx",
    include: /public[/\\]src[/\\].*\.js$/,
    exclude: [],
  },
  // CHANGED: also tell the dep pre-bundler that `.js` may contain JSX.
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
