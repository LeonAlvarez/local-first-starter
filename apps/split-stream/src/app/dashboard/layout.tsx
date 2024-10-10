import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold">SplitStream App</Link>
          <nav className="flex items-center space-x-4">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/expenses" className="hover:underline">Expenses</Link>
            <Link href="/groups" className="hover:underline">Groups</Link>
            <Link href="/" className="hover:underline">Logout</Link>
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
