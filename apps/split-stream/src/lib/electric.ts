import { ExtendedPGlite } from "@/components/providers/pglite";
import { PGliteInterface } from "@electric-sql/pglite";
import { LiveNamespace } from "@electric-sql/pglite/live";
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

export const TablesToSync: TablesToSync = [
  {
    table: getTableName(schema.users),
  },
  {
    table: getTableName(schema.groups),
  },
  {
    table: getTableName(schema.userGroups),
  },
  {
    table: getTableName(schema.expenses),
  },
  {
    table: getTableName(schema.expenseShares),
  },
] as const;

let isLocalDBSchemaSynced = false;

export type MyPGLiteWIthLive = (PGliteInterface | ExtendedPGlite) & LiveNamespace

export async function runMigrations(pg: PGliteInterface, dbName: string) {
  const db = createPgLiteClient(pg);

  console.log("isLocalDBSchemaSynced", isLocalDBSchemaSynced);
  if (!isLocalDBSchemaSynced) {
    const start = performance.now();
    try {
      await new PgDialect().migrate(
        clientMigrations,
        //@ts-expect-error for some reason it's not typed properly
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

export async function dropFks(pg: PGliteInterface) {
  await pg.query(`
    DO $$ 
      DECLARE 
        r RECORD;
        table_names TEXT[] := ARRAY['${TablesToSync.map(({ table }) => table).join("','")}'];
      BEGIN 
        RAISE NOTICE 'Table names: %', table_names;
        FOR r IN 
          SELECT 
            conname, 
            conrelid::regclass AS table_name 
          FROM 
              pg_constraint 
          WHERE 
              contype = 'f' 
              AND conname LIKE '%_fk' 
              AND conrelid::regclass::text = ANY(table_names)
        LOOP 
            EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', r.table_name, r.conname);
        END LOOP; 
    END $$; 
  `);
}

export async function syncTables(
  pg: PGliteInterface,
  electricBaseUrl: string
) {
  const syncStart = performance.now();
  await Promise.all(
    TablesToSync.map(({ shape, table, primaryKey }) => {
      const shapeUrl = `${electricBaseUrl}/${shape || table}`
      //@ts-expect-error Need to properpy type extension
      pg?.electric?.syncShapeToTable({
        shape: { url: shapeUrl },
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
