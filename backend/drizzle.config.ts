import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./database/index.ts",
  out: "./database/migrations/",
  dialect: "sqlite",
  driver: "d1-http",
});
