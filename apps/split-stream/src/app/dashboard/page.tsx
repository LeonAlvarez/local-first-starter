import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Assume we have these components implemented
import OverviewSection from "@/components/dashboard/overview";
import ExpenseBreakdown from "@/components/dashboard/expense-breakdown";
import BalanceSummary from "@/components/dashboard/balance-summary";
import UserEngagement from "@/components/dashboard/user-engagement";
import TransactionHistory from "@/components/dashboard/transaction-history";
import NotificationsAlerts from "@/components/dashboard/notification-alerts";
import SettingsCustomization from "@/components/dashboard/settings-customization";
import AnalyticsInsights from "@/components/dashboard/analytics-insights";
import GroupManagement from "@/components/dashboard/groups";

import { ScrollAreaScrollbar } from "@radix-ui/react-scroll-area";

export default function Dashboard() {
  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Tabs defaultValue="overview" className="space-y-4">
          <ScrollArea>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="balances">Balances</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <ScrollAreaScrollbar orientation="horizontal" />
          </ScrollArea>
          <TabsContent value="overview" className="space-y-4">
            <OverviewSection />
          </TabsContent>
          <TabsContent value="expenses" className="space-y-4">
            <ExpenseBreakdown />
          </TabsContent>
          <TabsContent value="balances" className="space-y-4">
            <BalanceSummary />
          </TabsContent>
          <TabsContent value="users" className="space-y-4">
            <UserEngagement />
          </TabsContent>
          <TabsContent value="groups" className="space-y-4">
            <GroupManagement />
          </TabsContent>
          <TabsContent value="transactions" className="space-y-4">
            <TransactionHistory />
          </TabsContent>
          <TabsContent value="notifications" className="space-y-4">
            <NotificationsAlerts />
          </TabsContent>
          <TabsContent value="settings" className="space-y-4">
            <SettingsCustomization />
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsInsights />
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}