import schema from "./schema";
import { DrizzleConfig } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
export type { PgDatabase, PgQueryResultHKT, PgSelect } from "drizzle-orm/pg-core";
export * from "drizzle-orm";

const queryClient = neon(process.env.DATABASE_URL!);
const queryPoolingClient = neon(process.env.DATABASE_POOL_URL!);
export const db = drizzle(queryClient, { schema } as DrizzleConfig<typeof schema>);
export const dbPool = drizzle(queryPoolingClient, { schema } as DrizzleConfig<typeof schema>);

export default db;