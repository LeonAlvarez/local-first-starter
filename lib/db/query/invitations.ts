import { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import groups, { Group } from "../schemas/groups";
import { type User } from "../schemas/users";
import { invitations } from "../schemas/invitations";

type invitationsSchema = {
  groups: typeof groups;
  invitations: typeof invitations
};

export type DbType = PgDatabase<PgQueryResultHKT, invitationsSchema>;

export function invitationsQuery(db: DbType) {
  function sendInvitation(userId: User["id"], groupId: Group["id"]) {
    return db.insert(invitations).values({
      userId,
      groupId,
      status: 'pending',
    });
  }

  return {
    sendInvitation
  }
}
