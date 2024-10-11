import { PGliteInterface } from "@electric-sql/pglite";
import { PGliteWithLive } from "@electric-sql/pglite/live";
import { PGliteWorker } from "@electric-sql/pglite/worker";
import {
  schema,
  createPgLiteClient,
  clientMigrations,
  PgDialect,
  getTableName,
} from "db/client";

type TablesToSync = {
  shape?: string;
  table: string;
  primaryKey?: string[];
}[];

const TablesToSync: TablesToSync = [
  {
    table: getTableName(schema.users),
  },
  {
    table: getTableName(schema.groups),
  },
  {
    table: getTableName(schema.userGroups),
  },
];

let isLocalDBSchemaSynced = false;

export type PGliteWorkerWithLive = PGliteWorker & {
  live: PGliteWithLive["live"];
};

export async function runMigrations(pg: PGliteInterface, dbName: string) {
  const db = createPgLiteClient(pg);

  console.log("isLocalDBSchemaSynced", isLocalDBSchemaSynced);
  if (!isLocalDBSchemaSynced) {
    const start = performance.now();
    try {
      await new PgDialect().migrate(
        clientMigrations,
        //@ts-ignore
        db._.session,
        dbName
      );
      isLocalDBSchemaSynced = true;
      console.info(`✅ Local database ready in ${performance.now() - start}ms`);
    } catch (cause) {
      console.error("❌ Local database schema migration failed", cause);
      throw cause;
    }
  }

  return db;
}

export async function syncTables(
  pg: PGliteInterface,
  electricBaseUrl: string
) {
  const syncStart = performance.now();
  await Promise.all(
    TablesToSync.map(({ shape, table, primaryKey }) => {
      //@ts-ignore
      pg.live?.syncShapeToTable({
        shape: { url: `${electricBaseUrl}/${shape || table}` },
        table,
        primaryKey: primaryKey || ["id"],
        shapeKey: shape || table,
      });
    })
  );

  console.info(
    `✅ Local database synced in ${performance.now() - syncStart}ms`
  );
}