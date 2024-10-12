"use client";

import { ExtendedPGlite } from "@/components/providers/pglite";
import { useUser } from "@/components/providers/user";
import { useLiveQuery, usePGlite } from "@electric-sql/pglite-react";
import { groupsQuery } from "db/query/groups";
import { Group, User, UserGroup } from "db/schema";
import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeamRole } from "db/schemas/users-groups";
import { DbType as GroupsDbType } from 'db/query/groups';

type GroupWithMembers = Group & {
  members: {
    id: User["id"];
    userName: User["userName"];
    firstName: User["firstName"];
    lastName: User["lastName"];
    email: User["email"];
    role: UserGroup["role"];
  }[];
};

export default function ManageGroup({ id }: { id: string }) {
  const pg = usePGlite() as ExtendedPGlite;
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const { user } = useUser();

  const { getGroupWithMembers } = useMemo(
    () => groupsQuery(pg._db as unknown as GroupsDbType),
    [pg]
  );

  const { sql, params } = useMemo(
    () => getGroupWithMembers(parseInt(id)).toSQL(),
    [id, getGroupWithMembers]
  );

  const [group] = useLiveQuery<GroupWithMembers>(sql, params)?.rows || [];
  console.log(group);

  const handleInviteMember = () => {
    // TODO: Implement invite logic
    console.log("Inviting member:", newMemberEmail);
    setNewMemberEmail("");
  };

  const handleRoleChange = (memberId: number, newRole: TeamRole) => {
    // TODO: Implement role change logic
    console.log(`Changing role for member ${memberId} to ${newRole}`);
  };

  const isAdminOrOwner = useMemo(() => {
    const currentUserInGroup = group?.members.find(
      (member) => member.id === user?.id
    );
    return (
      currentUserInGroup?.role === TeamRole.ADMIN ||
      currentUserInGroup?.role === TeamRole.OWNER
    );
  }, [group, user]);

  return (
    <div className="grid gap-4 grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle>Invite New Member</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Enter email address"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              disabled={!isAdminOrOwner}
            />
            <Button
              onClick={handleInviteMember}
              className="w-full"
              disabled={!isAdminOrOwner}
            >
              Send Invite
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Manage Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {group?.members?.map((member) => {
              const userName =
                member.userName || `${member.firstName}.${member.lastName}`;

              return (
                <div
                  key={member.id}
                  className="flex flex-col md:flex-row justify-between space-y-2 mb-6 md:mb-4"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={userName} alt={member.userName} />
                      <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select
                      defaultValue={member.role}
                      onValueChange={(value) =>
                        handleRoleChange(member.id, value as TeamRole)
                      }
                      disabled={!isAdminOrOwner}
                    >
                      <SelectTrigger className="flex-grow">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TeamRole.ADMIN}>Admin</SelectItem>
                        <SelectItem value={TeamRole.USER}>Member</SelectItem>
                        <SelectItem value={TeamRole.OWNER}>Owner</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      className="shrink-0"
                      disabled={!isAdminOrOwner}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
