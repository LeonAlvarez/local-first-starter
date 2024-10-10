import { Config, defineConfig } from "drizzle-kit";

export const migrationsFolder = "./migrations";

export const drizzleConfig: Config = {
  dialect: "postgresql",
  schema: "./schemas/*",
  out: migrationsFolder,
  dbCredentials: {
    url: process.env.DATABASE_URL!
  },
  verbose: true,
};

export default defineConfig(drizzleConfig);