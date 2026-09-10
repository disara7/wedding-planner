import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Frontend-only app — no API server, no proxy. Data lives in the browser.
export default defineConfig({
  plugins: [react()],
});
