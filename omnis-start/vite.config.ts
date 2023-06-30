import solid from "solid-start/vite";
import { defineConfig } from "vite";
import vercel from "solid-start-vercel";

export default defineConfig(() => {
  return {
    plugins: [solid({ ssr: false, adapter: vercel({ edge: false }) })],
    define: {
      "import.meta.vitest": "undefined" // don't include tests
    },
    test: {
      includeSource: ['src/**/*.{js,ts,tsx,jsx}'], // ...
    },
  };
});

