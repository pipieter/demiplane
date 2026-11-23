import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const envFile = fileURLToPath(new URL("../.env", import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  envDir: "../",
  plugins: [
    {
      name: "restart-on-env-change",
      configureServer(server) {
        server.watcher.add(envFile);
        server.watcher.on("all", (event, file) => {
          if (file === envFile && ["add", "change", "unlink"].includes(event)) {
            server.restart();
          }
        });
      },
    },
  ],
  server: {
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/vitest.setup.ts"],
  }
});
