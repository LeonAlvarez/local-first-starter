"use client"

import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollAreaScrollbar } from "@radix-ui/react-scroll-area";
import Link from "next/link";
import { usePathname } from 'next/navigation';

const tabItems = [
  { value: "overview", label: "Overview", href: "/dashboard" },
  { value: "groups", label: "Groups", href: "/dashboard/groups" },
  { value: "expenses", label: "Expenses", href: "/dashboard/expenses" },
  { value: "balances", label: "Balances", href: "/dashboard/balances" },
  { value: "users", label: "Users", href: "/dashboard/users" },
  { value: "transactions", label: "Transactions", href: "/dashboard/transactions" },
  { value: "notifications", label: "Notifications", href: "/dashboard/notifications" },
  { value: "settings", label: "Settings", href: "/dashboard/settings" },
  { value: "analytics", label: "Analytics", href: "/dashboard/analytics" },
  { value: "repl", label: "Repl", href: "/dashboard/repl" },
];

export function DashboardTabs() {
  const pathname = usePathname();
  const currentTab = pathname.split('/')[2] || 'overview';

  return (
    <Tabs value={currentTab} className="space-y-4">
      <ScrollArea>
        <TabsList>
          {tabItems.map((item) => (
            <Link href={item.href} key={item.value}>
              <TabsTrigger value={item.value}>{item.label}</TabsTrigger>
            </Link>
          ))}
        </TabsList>
        <ScrollAreaScrollbar orientation="horizontal" />
      </ScrollArea>
    </Tabs>
  );
}