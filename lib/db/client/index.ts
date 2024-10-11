export { PgDialect } from "drizzle-orm/pg-core";
export type { PgQueryResultHKT, PgDatabase } from "drizzle-orm/pg-core";
import { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { drizzle as PgLiteDrizzle } from "drizzle-orm/pglite";
export * from "drizzle-orm";

export { type User, type InsertUser, insertUserSchema, selectUserSchema, } from "../schemas/users"
export { type Group, type InsertGroup, insertGroupSchema, selectGroupSchema, } from "../schemas/groups"
export { type UserGroup, type InsertUserGroup, insertUserGroupSchema, selectUserGroupSchema, } from "../schemas/users-groups"
export { schema } from "./schema"
import schema from "./schema"
import migrations from "./migrations/export.json";


export type DbType = PgDatabase<PgQueryResultHKT, typeof schema>;

export const clientMigrations = migrations;

export const createPgLiteClient = (client: any) => {
  return PgLiteDrizzle(client, {
    schema,
  });
};

export default createPgLiteClient;
