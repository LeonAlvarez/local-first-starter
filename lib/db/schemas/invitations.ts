import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import users from "./users";
import groups from "./groups";
import { groupRoleEnum, TeamRole } from "./users-groups";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export enum InvitationStatus {
  PENDING = "pending",
  ACEPTED = "accepted",
  REJECTED = "rejected",
}

export const invitationStatusEnum = pgEnum(
  "invitationStatus",
  Object.values(InvitationStatus) as [InvitationStatus, ...InvitationStatus[]]
);

export const invitations = pgTable(
  "invitations",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    invitedBy: integer("invited_by").references(() => users.id),
    groupId: integer("group_id").references(() => groups.id),
    role: groupRoleEnum().notNull().default(TeamRole.USER),
    status: invitationStatusEnum().notNull().default(InvitationStatus.PENDING),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => {
    return {
      uniqueUserGroup: uniqueIndex("unique_user_invite").on(
        table.userId,
        table.groupId
      ),
    };
  }
);

export const insertInviteSchema = createInsertSchema(invitations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectInviteSchema = createSelectSchema(invitations);

export type InsertInvite = z.infer<typeof insertInviteSchema>;
export type UserInvite = z.infer<typeof selectInviteSchema>;

export default users;
