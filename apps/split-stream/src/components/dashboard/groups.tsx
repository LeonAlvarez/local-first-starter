"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLiveQuery } from '@electric-sql/pglite-react';

// Mock data for groups
const initialGroups = [
  { id: 1, name: 'Family', memberCount: 4 },
  { id: 2, name: 'Roommates', memberCount: 3 },
  { id: 3, name: 'Vacation 2023', memberCount: 6 },
];

const GroupManagement: React.FC = () => {
  const [newGroupName, setNewGroupName] = useState('');
  const groups = useLiveQuery(`select * from groups`, [])?.rows || []

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      const newGroup = {
        id: groups.length + 1,
        name: newGroupName.trim(),
        memberCount: 1,
      };

      console.log(newGroup)
      setNewGroupName('');
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
              <div key={group.id} className="flex justify-between items-center p-2 border-b">
                <div>
                  <h3 className="font-semibold">{group.name}</h3>
                  <p className="text-sm text-gray-500">{group.memberCount} members</p>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupManagement;