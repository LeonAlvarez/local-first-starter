import { type SQL, and, eq, getTableColumns, sql } from "drizzle-orm";
import { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import groups from "../schemas/groups";
import userGroups from "../schemas/users-groups";
import { type User } from "../schemas/users";
import usersGroups from "../schemas/users-groups";

type groupSchema = {
  groups: typeof groups;
};

export type DbType = PgDatabase<PgQueryResultHKT, groupSchema>;

export function groupsQuery(db: DbType) {
  const getGroups = (where?: SQL) => {
    return db.select().from(groups).where(where);
  };

  const getUserGroups = (userId: User["id"]) => {
    return db
      .select()
      .from(groups)
      .leftJoin(userGroups, eq(groups.id, userGroups.groupId))
      .where(eq(userGroups.userId, userId));
  };

  const getUserGroupsWithMemberCount = (userId: User["id"], filters: SQL) => {
    const group_count = db
      .select({
        groupId: groups.id,
        user_count: sql<number>`COUNT(DISTINCT ${usersGroups.userId})`.as(
          "user_count"
        ),
      })
      .from(groups)
      .leftJoin(usersGroups, eq(groups.id, usersGroups.groupId))
      .groupBy(groups.id)
      .as("group_count");

    return db
      .select({
        ...getTableColumns(groups),
        usersCount: sql`group_count.user_count`.as("usersCount"),
      })
      .from(usersGroups)
      .leftJoin(groups, eq(usersGroups.groupId, groups.id))
      .leftJoin(group_count, eq(userGroups.groupId, group_count.groupId))
      .where(and(eq(userGroups.userId, userId), filters))
  };

  return {
    getGroups,
    getUserGroups,
    getUserGroupsWithMemberCount,
  };
}
