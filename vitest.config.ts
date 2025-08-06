import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["apps/**/*.test.ts", "packages/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "tests/e2e/**"],
  },
  resolve: {
    alias: {
      "@leasy/server": resolve(__dirname, "./apps/server/src"),
      "@leasy/shared": resolve(__dirname, "./packages/shared/src"),
    },
  },
});
