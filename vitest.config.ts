import { defineConfig } from "vitest/config";
import { previewStyles } from "./scripts/library-preview/styles.mjs";

export default defineConfig({
  plugins: [previewStyles()],
  ssr: { noExternal: ["@operately/turboui", /^@atlaskit\//] },
  test: {
    environment: "jsdom",
    include: [
      "src/components/library-preview/**/*.spec.tsx",
      "src/utils/library/*.spec.ts",
    ],
    setupFiles: ["./src/components/library-preview/shell/test-setup.ts"],
  },
});
