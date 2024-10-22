import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { LogOutButton } from "@/components/logout-button";
import { UserProvider } from "@/components/providers/user";
import { PgLiteWorkerProvider } from "@/components/providers/pglite";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DashboardTabs } from "@/components/dashboard/navigation";
import { getUser } from "@/app/auth/actions";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userPromise = getUser();

  return (
    <UserProvider userPromise={userPromise}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">SplitStream</Link>
            <nav className="flex items-center space-x-4">
              {/* <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              <Link href="/expenses" className="hover:underline">Expenses</Link>
              <Link href="/groups" className="hover:underline">Groups</Link> */}
              <LogOutButton />
              <ModeToggle />
            </nav>
          </div>
        </header>
        <PgLiteWorkerProvider debug={1}>
          <ScrollArea className="flex-1 flex flex-col">
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
              <DashboardTabs />
              {children}
            </div>
          </ScrollArea>
        </PgLiteWorkerProvider>
        <footer className="border-t mt-auto">
          <div className="container mx-auto px-4 py-2 text-center text-xs text-muted-foreground">
            © 2024 SplitStream. All rights reserved.
          </div>
        </footer>
      </div>
    </UserProvider>
  );
}
