import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@store": `${path.resolve(__dirname, "./src/App/store/")}`,
      "@routes": `${path.resolve(__dirname, "./src/App/routes/")}`,
      "@hoc": `${path.resolve(__dirname, "./src/App/utils/hoc/")}`,
      "@hooks": `${path.resolve(__dirname, "./src/App/utils/hooks/")}`,
      "@types": `${path.resolve(__dirname, "./src/App/utils/types/")}`,
      "@services": `${path.resolve(__dirname, "./src/App/services/")}`,
      "@helpers": `${path.resolve(__dirname, "./src/App/utils/helpers/")}`,
      "@components": `${path.resolve(__dirname, "./src/App/components/")}`,
      "@containers": `${path.resolve(__dirname, "./src/App/containers/")}`,
      "@constants": `${path.resolve(__dirname, "./src/App/utils/constants/")}`,
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
});
