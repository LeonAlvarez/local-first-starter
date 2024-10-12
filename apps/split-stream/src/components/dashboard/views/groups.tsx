"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLiveQuery, usePGlite } from "@electric-sql/pglite-react";
import { Group } from "db/schema";
import { groupsQuery, DbType as GroupsDbType } from "db/query/groups";
import { ExtendedPGlite } from "@/components/providers/pglite";
import { useUser } from "@/components/providers/user";
import { schema, ilike } from "db/client";
import Link from "next/link";

type GroupWithCount = Group & { usersCount: number };

const MyGroups: React.FC = () => {
  const [newGroupName, setNewGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useUser();
  const pg = usePGlite() as ExtendedPGlite;

  const { getUserGroupsWithMemberCount } = useMemo(
    () => groupsQuery(pg._db as unknown as GroupsDbType),
    [pg]
  );

  const { sql, params } = useMemo(
    () =>
      getUserGroupsWithMemberCount(
        user.id,
        ilike(schema.groups.name, `%${searchTerm}%`)
      )
        .orderBy(schema.groups.id)
        .toSQL(),
    [searchTerm, user, getUserGroupsWithMemberCount]
  );

  const groups = useLiveQuery<GroupWithCount>(sql, params)?.rows || [];

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      const newGroup = {
        id: groups.length + 1,
        name: newGroupName.trim(),
        memberCount: 1,
      };

      console.log(newGroup);
      setNewGroupName("");
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <Card className="flex-shrink-0">
        <CardHeader>
          <CardTitle>Create New Group</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <Button onClick={handleCreateGroup}>Create</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-grow overflow-hidden">
        <CardHeader>
          <CardTitle className="mb-4">Your Groups</CardTitle>
          <Input
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardHeader>
        <CardContent className="h-full p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="flex justify-between items-center p-2 border-b"
                >
                  <div>
                    <h3 className="font-semibold">{group.name}</h3>
                    <p className="text-sm text-gray-500">
                      {group.usersCount} members
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Link href={`/dashboard/groups/${group.id}`}>
                      Manage
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyGroups;
