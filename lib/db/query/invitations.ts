import { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { and, eq } from "drizzle-orm";
import groups, { Group } from "../schemas/groups";
import { InsertInvite, invitations, InvitationStatus } from "../schemas/invitations";
import { User } from "../schema";

type invitationsSchema = {
  groups: typeof groups;
  invitations: typeof invitations
};

export type DbType = PgDatabase<PgQueryResultHKT, invitationsSchema>;

export function invitationsQuery(db: DbType) {
  function createInvite(data: InsertInvite) {
    return db.insert(invitations).values({
      ...data,
      status: InvitationStatus.PENDING,
    }).returning();
  }

  function getUserInvites(userId: User["id"], status?: InvitationStatus) {
    return db.select().from(invitations).where(
      and(
        eq(invitations.userId, userId),
        status && eq(invitations.status, status)
      )
    )
  }
  function getGroupInvites(groupId: Group["id"], status?: InvitationStatus) {
    return db.select().from(invitations).where(
      and(
        eq(invitations.groupId, groupId),
        status && eq(invitations.status, status)
      )
    )
  }

  return {
    createInvite,
    getUserInvites,
    getGroupInvites,
  }
}
