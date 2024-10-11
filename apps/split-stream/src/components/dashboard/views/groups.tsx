"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLiveQuery, usePGlite } from "@electric-sql/pglite-react";
import { Group } from "db/schema";
import { groupsQuery } from "db/query/groups";
import { ExtendedPGlite } from "@/components/providers/pglite";
import { useUser } from "@/components/providers/user";
import { schema, ilike } from "db/client";

type GroupWithCount = Group & { usersCount: number };

const GroupManagement: React.FC = () => {
  const [newGroupName, setNewGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useUser();
  const pg = usePGlite() as ExtendedPGlite;

  const { getUserGroupsWithCount } = useMemo(() => groupsQuery(pg._db), [pg]);

  const { sql, params } = useMemo(
    () =>
      getUserGroupsWithCount(user.id)
        .$dynamic()
        .where(
          searchTerm ? ilike(schema.groups.name, `%${searchTerm}%`) : undefined
        )
        .toSQL(),
    [searchTerm, user.id, getUserGroupsWithCount]
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
                    Manage
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

export default GroupManagement;
