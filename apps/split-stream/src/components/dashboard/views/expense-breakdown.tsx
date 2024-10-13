"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMemo } from "react";
import { useUser } from "@/components/providers/user";
import { categoriesMap, expensesQuery } from "db/query/expenses";
import { useNewDrizzleLiveQuery } from "@/hooks/useDrizzleLiveQuery";
import { DbType, schema } from "db/client";
import { Expense, ExpenseShare } from "db/schema";
import { formatCents } from "@/lib/format";

export type UserExpense = Expense & { share: ExpenseShare };

// Custom tooltip component
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    console.log(data);
    return (
      <div className="bg-primary-foreground p-2 border border-gray-200 rounded shadow">
        <p className="font-semibold">{data.label}</p>
        <p>${formatCents(data.value)}</p>
      </div>
    );
  }
  return null;
};

export default function ExpenseBreakdown() {
  const { user } = useUser();

  const expenses = useNewDrizzleLiveQuery({
    queryFn: (db: DbType) =>
      expensesQuery(db).getUserExpenses(user.id).orderBy(schema.expenses.id),
    key: "expenses",
    debug: true,
  });

  const groupedExpenses = useMemo(() => {
    const grouped = (expenses || []).reduce((acc, { type, share }) => {
      const { name, label, color } = categoriesMap[type!] || categoriesMap.misc;
      if (!acc[name]) {
        acc[name] = {
          label,
          name,
          value: 0,
          color,
        };
      }
      acc[name].value += share.shareAmount;
      return acc;
    }, {} as Record<string, { value: number; label: string; name: string; color: string }>);

    return Object.values(grouped);
  }, [expenses]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2 md:col-span-1">
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={groupedExpenses}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {groupedExpenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Expense List</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <ul className="space-y-2">
              {groupedExpenses.map((group, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: group.color }}
                    ></div>
                    {group.name}
                  </span>
                  <span className="font-semibold">
                    ${formatCents(group.value)}
                  </span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
