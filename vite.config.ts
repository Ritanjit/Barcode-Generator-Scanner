import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  server: {
    // use the below two to use https for mobile qr permissions
    // https: {},
    // host: true,
    port: 3000,
  },
  plugins: [tsconfigPaths(), react(), tailwindcss()], // add " , basicSsl() " to use https for mobile qr permissions
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
