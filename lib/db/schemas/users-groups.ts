import {
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { groups } from "./groups";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export enum TeamRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  USER = "USER",
}

export const groupRoleEnum = pgEnum(
  "role",
  Object.values(TeamRole) as [TeamRole, ...TeamRole[]]
);

export const userGroups = pgTable(
  "users_groups",
  {
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    groupId: integer("group_id")
      .references(() => groups.id)
      .notNull(),
    role: groupRoleEnum().notNull().default(TeamRole.USER),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      uniqueUserGroup: uniqueIndex("unique_user_group").on(
        table.userId,
        table.groupId
      ),
    };
  }
);

export const insertUserGroupSchema = createInsertSchema(userGroups);
export const selectUserGroupSchema = createSelectSchema(userGroups);

export type InsertUserGroup = z.infer<typeof insertUserGroupSchema>;
export type UserGroup = z.infer<typeof selectUserGroupSchema>;

export default userGroups;
