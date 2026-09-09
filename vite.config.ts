import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The API runs separately (npm run dev:api on :4000). In dev the browser talks
// to Vite on :5173 and these proxy rules forward /api to the Express server,
// so cookies stay first-party and there is no CORS to configure.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
