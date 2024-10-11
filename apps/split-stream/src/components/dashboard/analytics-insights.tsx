"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsInsights() {

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Spending Trends</CardTitle>
        </CardHeader>
        <CardContent>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>User Behavior</CardTitle>
        </CardHeader>
        <CardContent>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Predictive Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">Projected Expenses for Next Month</p>
          <p className="text-3xl font-bold mt-2">$1,250.00</p>
          <p className="text-sm text-muted-foreground mt-1">Based on historical data and current trends</p>
        </CardContent>
      </Card>
    </div>
  );
}