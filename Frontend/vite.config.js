import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from 'vite-tsconfig-paths';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),tsconfigPaths()],
  base:"/John_Hardy_Portfolio",
  server: {
    port: 5173,
    // If you serve behind a proxy and want HMR to connect to a specific host/port:
    hmr: {
      host: "localhost",
      protocol: "ws",
      port: 5173
    }
  }
   
});