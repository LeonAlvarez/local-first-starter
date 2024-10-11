"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { useTheme } from "next-themes";

export default function BalanceSummary() {
  const { theme: currentTheme } = useTheme();

  const outstandingBalancesData = [
    { user: 'User A', owed: 120, owes: 0 },
    { user: 'User B', owed: 0, owes: 50 },
    { user: 'User C', owed: 0, owes: 30 },
    { user: 'User D', owed: 80, owes: 0 },
    { user: 'User E', owed: 0, owes: 120 },
  ];

  const netBalanceData = [
    { user: 'User A', netBalance: 120 },
    { user: 'User B', netBalance: -50 },
    { user: 'User C', netBalance: -30 },
    { user: 'User D', netBalance: 80 },
    { user: 'User E', netBalance: -120 },
  ];

  const chartConfig = {
    owed: {
      label: "Owed",
      color: "hsl(var(--chart-1))",
    },
    owes: {
      label: "Owes",
      color: "hsl(var(--chart-2))",
    },
    netBalance: {
      label: "Net Balance",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Settlement Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">All Balances Settled</p>
            <p className="text-sm text-gray-500">Last settlement: 2 days ago</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Balances</CardTitle>
        </CardHeader>
        <CardContent>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Net Balance</CardTitle>
        </CardHeader>
        <CardContent>
        </CardContent>
      </Card>
    </div>
  );
}