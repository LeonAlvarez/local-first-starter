import db from "db";
import { invitationsQuery, DbType } from "db/query/invitations"
import { InsertInvite, InvitationStatus } from "db/schemas/invitations";
import { TeamRole } from "db/schemas/users-groups";

const { createInvite } = invitationsQuery(db as unknown as DbType);

export async function inviteUserToGroup({
  invitedBy,
  groupId,
  userId,
  role = TeamRole.USER,
  status = InvitationStatus.PENDING,
}: InsertInvite) {
  const [invite] = await createInvite({
    invitedBy,
    groupId,
    userId,
    role,
    status
  });

  // TODO: REAL WORLD
  // this should be handled via some job, that fires email, etc
  return invite;
}