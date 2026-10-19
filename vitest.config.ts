import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**", ".claude/**"],
    environment: "node",
    // next-intl imports `next/server` without an extension, which Node's ESM
    // resolver rejects (next has no exports map); let Vite resolve it.
    server: { deps: { inline: ["next-intl"] } },
  },
});
