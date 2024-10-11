import { type SQL, count, eq, getTableColumns, sql } from 'drizzle-orm'
import { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import groups from '../schemas/groups';
import userGroups from '../schemas/users-groups';
import { type User } from '../schemas/users';

type groupSchema = {
  groups: typeof groups
}

export type DbType = PgDatabase<PgQueryResultHKT, groupSchema>;

export function groupsQuery(db: DbType) {
  const getGroups = (where?: SQL) => {
    return db.select().from(groups).where(where);
  }

  const getUserGroups = (userId: User["id"]) => {
    return db.select()
      .from(groups)
      .leftJoin(userGroups, eq(groups.id, userGroups.groupId))
      .where(eq(userGroups.userId, userId));
  }

  const getUserGroupsWithCount = (userId: User["id"]) => {
    return db.select({
      ...getTableColumns(groups),
      usersCount: count(userGroups.userId).as('usersCount'),
    })
      .from(groups)
      .innerJoin(userGroups, eq(groups.id, userGroups.groupId))
      .where(
        sql`EXISTS (
          SELECT 1 FROM ${userGroups}
          WHERE ${userGroups.groupId} = ${groups.id} AND ${userGroups.userId} = ${userId}
        )`
      )
      .groupBy(groups.id);
  }

  return {
    getGroups,
    getUserGroups,
    getUserGroupsWithCount
  }
}