import { defineConfig } from "orval";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"
const defaultQueryOverride = {
  useQuery: true,
  signal: true,
  useSuspenseQuery: true,
};

export default defineConfig({
  app: {
    input: {
      target: `${baseURL}/openapi.json`,
      filters: {
        tags: [/^(?!.*healthcheck).*$/],
      },
    },
    output: {
      clean: true,
      mode: "tags-split",
      workspace: ".",
      target: "./services/api/endpoints",
      schemas: "./services/api/models",
      indexFiles: true,
      client: "swr",
      mock: false,
      override: {
        mutator: {
          path: "./lib/orval/mutator.ts",
          name: "clientFetcher",
        },
      },
    },
  },
  zod: {
    input: {
      target: `${baseURL}/openapi.json`,
    },
    output: {
      mode: "tags-split",
      client: "zod",
      target: "./services/api/endpoints",
      workspace: ".",
      fileExtension: ".zod.ts",
    },
  },
});
