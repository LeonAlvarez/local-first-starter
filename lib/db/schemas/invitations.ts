import { pgTable, serial, integer, varchar, timestamp, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';
import users from './users';
import groups from './groups';

export enum InvitationStatus {
  PENDING = "pending",
  ACEPTED = "accepted",
  REJECTED = "rejected",
}

export const invitationStatusEnum = pgEnum(
  "invitationStatus",
  Object.values(InvitationStatus) as [InvitationStatus, ...InvitationStatus[]]
);

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  invitedBy: integer('invited_by').references(() => users.id),
  groupId: integer('group_id').references(() => groups.id),
  role: invitationStatusEnum().notNull().default(InvitationStatus.PENDING),
  status: varchar('status', { length: 255 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
},
  (table) => {
    return {
      uniqueUserGroup: uniqueIndex("unique_user_invite").on(
        table.userId,
        table.groupId,
      ),
    };
  });