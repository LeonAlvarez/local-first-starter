import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { LogOutButton } from "@/components/logout-button";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">SplitStream App</Link>
          <nav className="flex items-center space-x-4">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/expenses" className="hover:underline">Expenses</Link>
            <Link href="/groups" className="hover:underline">Groups</Link>
            <LogOutButton />
            <ModeToggle />
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          © 2024 SplitStream. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
