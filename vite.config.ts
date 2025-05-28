import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./", // This ensures assets are loaded correctly
  build: {
    outDir: "/opt/render/project/src/dist",
    assetsDir: "assets",
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
  },
});
