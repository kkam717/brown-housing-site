import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages project sites are served from /repo-name/. Relative base ("./")
// breaks fetch() on nested routes like /listings (resolves to /listings/data/...).
const pagesBase =
  process.env.VITE_BASE_PATH ??
  (process.env.GITHUB_ACTIONS === "true" ? "/brown-housing-site/" : "/");

export default defineConfig({
  plugins: [react()],
  base: pagesBase,
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
