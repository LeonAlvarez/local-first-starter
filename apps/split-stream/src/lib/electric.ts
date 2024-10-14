import { ExtendedPGlite } from "@/components/providers/pglite";
import { Shape, ShapeStream } from "@electric-sql/client";
import { PGliteInterface } from "@electric-sql/pglite";
import { SyncShapeToTableOptions } from "@electric-sql/pglite-sync";
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

const shapeUrl = ({
  shape,
  table,
  electricBaseUrl,
  where = "",
}: {
  electricBaseUrl: string;
  shape?: string;
  table: string;
  where?: string;
}) => `${electricBaseUrl}/${shape || table}?where=${where || ""}`;

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

export type MyPGLiteWIthLive = (PGliteInterface | ExtendedPGlite) &
  LiveNamespace;

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
        table_names TEXT[] := ARRAY['${TablesToSync.map(
          ({ table }) => table
        ).join("','")}'];
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

export async function syncTables(pg: PGliteInterface, electricBaseUrl: string) {
  const syncStart = performance.now();
  await Promise.all(
    TablesToSync.map(({ shape, table, primaryKey }) => {
      const shapeUrl = `${electricBaseUrl}/${shape || table}`;
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

type ShapeSyncResult = {
  unsubscribe: () => void;
  readonly isUpToDate: boolean;
  readonly shapeId: string;
  subscribeOnceToUpToDate: (
    cb: () => void,
    error: (err: Error) => void
  ) => () => void;
  unsubscribeAllUpToDateSubscribers: () => void;
};

type PgLiteWithSync = PGliteInterface & {
  electric: {
    syncShapeToTable: (
      options: SyncShapeToTableOptions
    ) => Promise<ShapeSyncResult>;
  };
};

export async function waterFallingSync(
  pg: PgLiteWithSync,
  electricBaseUrl: string,
  userId: number
) {
  if (!userId) return;
  const syncStart = performance.now();
  const userGroupsTable = getTableName(schema.userGroups);
  const groupsTable = getTableName(schema.groups);
  const usersTable = getTableName(schema.users);
  const expensesTable = getTableName(schema.expenses);
  const expenseSharesTable = getTableName(schema.expenseShares);

  const currentSubscriptions = new Map<
    string,
    ShapeSyncResult | ShapeSyncResult[]
  >();
  const removeCurrentSubcription = async (key: string) => {
    const subscription = currentSubscriptions.get(key);

    if (!subscription) {
      console.error("Subscription not found");
      return;
    }

    if (!Array.isArray(subscription)) {
      subscription.unsubscribe();
      await pg.query(`TRUNCATE TABLE ${key}`);
      console.log(`✅ ${key} subscription removed and table truncated`);
      return;
    }

    subscription.forEach((sub) => sub.unsubscribe());
    await pg.query(
      `TRUNCATE TABLE ${groupsTable}, ${userGroupsTable}, ${expensesTable}, ${expenseSharesTable}`
    );
    console.log(`✅ ${key} subscriptions removed and tables truncated`);
  };

  new Shape(
    new ShapeStream({
      url: shapeUrl({
        electricBaseUrl,
        table: userGroupsTable,
        where: userId ? `user_id=${userId}` : "",
      }),
    })
  ).subscribe(async (data) => {
    // Get user related groups from user_groups using `user_id=${userId}`
    const groupIds = [...data.values()]?.map((x) => x.group_id);

    new Shape(
      new ShapeStream({
        url: shapeUrl({
          electricBaseUrl,
          table: userGroupsTable,
          where: groupIds.length ? `group_id IN (${groupIds.join(",")})` : "",
        }),
      })
    ).subscribe(async (data) => {
      // Get members of the grouos current user is member of
      const userIds = [...data.values()]?.map((x) => x.group_id);
      await removeCurrentSubcription(usersTable);
      const userSync = await pg.electric.syncShapeToTable({
        shape: {
          url: shapeUrl({
            electricBaseUrl,
            table: usersTable,
            where: groupIds.length ? `id IN (${userIds.join(",")})` : "",
          }),
        },
        table: usersTable,
        primaryKey: ["id"],
        shapeKey: usersTable,
      });
      currentSubscriptions.set(usersTable, userSync);
    });

    await removeCurrentSubcription(groupsTable);
    const groupSubscriptions = await Promise.all([
      // Sync user_groups to all the groups where the user is member
      pg.electric.syncShapeToTable({
        shape: {
          url: shapeUrl({
            electricBaseUrl,
            table: userGroupsTable,
            where: groupIds.length ? `group_id IN (${groupIds.join(",")})` : "",
          }),
        },
        table: userGroupsTable,
        primaryKey: ["id"],
        shapeKey: userGroupsTable,
      }),
      // Sync groups to all the groups where the user is member
      pg.electric.syncShapeToTable({
        shape: {
          url: shapeUrl({
            electricBaseUrl,
            table: groupsTable,
            where: groupIds.length ? `id IN (${groupIds.join(",")})` : "",
          }),
        },
        table: groupsTable,
        primaryKey: ["id"],
        shapeKey: groupsTable,
      }),
      //Sync expenses to all the groups where the user is member, or the user itself
      pg.electric.syncShapeToTable({
        shape: {
          url: shapeUrl({
            electricBaseUrl,
            table: expensesTable,
            where: `payer_id=${userId} ${groupIds.length ? `OR group_id IN (${groupIds.join(",")})` : ""}`,
          }),
        },
        table: expensesTable,
        primaryKey: ["id"],
        shapeKey: expensesTable,
      }),
      // Sync expense_shares to all the groups where the user is member, or the user itself
      pg.electric.syncShapeToTable({
        shape: {
          url: shapeUrl({
            electricBaseUrl,
            table: expenseSharesTable,
            where: `user_id=${userId} ${ groupIds.length ? `OR group_id IN (${groupIds.join(",")})` : ""}`,
          }),
        },
        table: expenseSharesTable,
        primaryKey: ["id"],
        shapeKey: expenseSharesTable,
      }),
    ]);
    currentSubscriptions.set(groupsTable, groupSubscriptions);
  });

  console.info(
    `✅ Local database synced in ${performance.now() - syncStart}ms`
  );
}
