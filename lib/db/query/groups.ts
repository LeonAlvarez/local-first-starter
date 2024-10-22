import { type SQL, and, eq, getTableColumns, sql } from "drizzle-orm";
import { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import groups, { Group } from "../schemas/groups";
import userGroups, { UserGroup } from "../schemas/users-groups";
import { type PublicUser as User } from "../schemas/users";
import usersGroups from "../schemas/users-groups";
import users from "../client/schemas/users";
import publicUsers from "../client/schemas/users";

type groupsSchema = {
  groups: typeof groups;
  users: typeof users | typeof publicUsers;
  usersGroups: typeof usersGroups;
};

export type DbType = PgDatabase<PgQueryResultHKT, groupsSchema>;

type UserWithRole = {
  id: User["id"];
  userName: User["userName"];
  firstName: User["firstName"];
  lastName: User["lastName"];
  role: UserGroup["role"];
  email: User["email"];
};

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
        usersCount: sql<number>`group_count.user_count`.as("usersCount"),
      })
      .from(usersGroups)
      .leftJoin(groups, eq(usersGroups.groupId, groups.id))
      .leftJoin(group_count, eq(userGroups.groupId, group_count.groupId))
      .where(and(eq(userGroups.userId, userId), filters));
  };

  const getGroupWithMembers = (groupId: Group["id"]) => {
    return db
      .select({
        ...getTableColumns(groups),
        members: sql<UserWithRole[]>`json_agg(json_build_object(
          'id', ${users.id},
          'userName', ${users.userName},
          'firstName', ${users.firstName},
          'lastName', ${users.lastName},
          'role', ${usersGroups.role},
          'email', ${users.email}
        ))`.as("members"),
      })
      .from(groups)
      .leftJoin(usersGroups, eq(groups.id, usersGroups.groupId))
      .leftJoin(users, eq(usersGroups.userId, users.id))
      .where(eq(groups.id, groupId))
      .groupBy(groups.id);
  };

  const isMemberber = (userId: User["id"], groupId: Group["id"]) => {
    return db
      .select({ id: userGroups.id })
      .from(userGroups)
      .where(
        and(
          eq(userGroups.userId, userId),
          eq(userGroups.groupId, groupId)
        )
      );
  };

  return {
    getGroups,
    getUserGroups,
    getUserGroupsWithMemberCount,
    getGroupWithMembers,
    isMemberber,
  };
}
