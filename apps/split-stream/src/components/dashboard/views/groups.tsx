"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLiveQuery, usePGlite } from "@electric-sql/pglite-react";
import { Group } from "db/schema";
import { groupsQuery } from "db/query/groups";
import { ExtendedPGlite } from "@/components/providers/pglite";
import { useUser } from "@/components/providers/user";

type GroupWithCount = Group & { usersCount: number };

const GroupManagement: React.FC = () => {
  const [newGroupName, setNewGroupName] = useState("");
  const { user } = useUser();
  const pg = usePGlite() as ExtendedPGlite;
  const { getUserGroupsWithCount } = groupsQuery(pg._db);

  const { sql, params } = getUserGroupsWithCount(user.id).toSQL();
  const groups = useLiveQuery<GroupWithCount>(sql, params)?.rows || [];

  console.log(groups)
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
    <div className="space-y-4">
      <Card>
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

      <Card>
        <CardHeader>
          <CardTitle>Your Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
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
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupManagement;
