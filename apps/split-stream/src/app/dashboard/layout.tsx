import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { LogOutButton } from "@/components/logout-button";
import { UserProvider } from "@/components/providers/user";
import { getUser } from "@/app/auth/actions";
import { PGliteWorker } from "@electric-sql/pglite/worker";
import { PgLiteWorkerProvider } from "@/components/providers/pglite";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider userPromise={getUser()}>
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
        <PgLiteWorkerProvider>
          {children}
        </PgLiteWorkerProvider>
        <footer className="border-t">
          <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
            © 2024 SplitStream. All rights reserved.
          </div>
        </footer>
      </div>
    </UserProvider>
  );
}
