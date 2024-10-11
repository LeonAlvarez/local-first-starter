import { defineConfig } from "drizzle-kit";
import { drizzleConfig } from "./drizzle.config";

export const migrationsFolder = `./client/migrations`;

export default defineConfig({
  ...drizzleConfig,
  schema: [
    `./schemas/users.ts`,
    `./schemas/groups.ts`,
    `./schemas/users-group.ts`
  ],
  out: migrationsFolder,
  verbose: true,
});
