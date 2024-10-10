"use client"

import { logout } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

export function LogOutButton() {
  const handleLogout = async() => {
    await logout('/');
  };

  return (
    <Button onClick={handleLogout} variant="link">
      Logout
    </Button>
  );
}