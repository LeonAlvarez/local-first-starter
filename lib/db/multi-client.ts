import schema from "./schema";
import { PgDatabase, type PgQueryResultHKT } from "drizzle-orm/pg-core";

enum DB_CLIENTS {
  NEON = 'neon',
  PG = 'pg'
}

const DB_CLIENT = process.env.DB_CLIENT as DB_CLIENTS || DB_CLIENTS.NEON;
export type DbType = PgDatabase<PgQueryResultHKT, typeof schema>;

type DbInitializer = () => Promise<DbType>;

const dbInitializers: Record<DB_CLIENTS, DbInitializer> = {
  [DB_CLIENTS.NEON]: async () => {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    const neonClient = neon(process.env.DATABASE_URL!);
    return drizzle(neonClient, { schema }) as unknown as DbType;
  },
  [DB_CLIENTS.PG]: async () => {
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const pg = await import("pg");
    const pool = new pg.default.Pool({
      connectionString: process.env.DATABASE_POOL_URL,
      ssl: true,
    });
    return drizzle(pool, { schema }) as unknown as DbType;
  }
};

export const getDb = dbInitializers[DB_CLIENT]
export const db = await getDb();

export default db;