import fs from "node:fs/promises";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { migrationsFolder } from "../client.drizzle.config";

const file = `${migrationsFolder}/export.json`;

const allMigrations = readMigrationFiles({
  migrationsFolder,
});

await fs.writeFile(
  `${file}`,
  JSON.stringify(allMigrations, null, 2),
  {
    flag: "w",
  }
);