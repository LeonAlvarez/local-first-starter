import { type SQL, eq } from 'drizzle-orm'
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

  return {
    getGroups,
    getUserGroups
  }
}