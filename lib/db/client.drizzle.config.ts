import { defineConfig } from "drizzle-kit";
import { drizzleConfig } from "./drizzle.config";

export const migrationsFolder = `./client/migrations`;

export default defineConfig({
  ...drizzleConfig,
  schema: "./client/schemas/*",
  out: migrationsFolder,
  verbose: true,
});
