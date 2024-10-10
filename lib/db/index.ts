import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from 'pg'
import schema from "./schema";
import { DrizzleConfig } from "drizzle-orm";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_POOL_URL!,
});

const db = drizzle(pool, { schema } as DrizzleConfig<typeof schema>);

export default db;
