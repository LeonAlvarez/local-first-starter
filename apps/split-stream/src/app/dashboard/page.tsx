import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-12">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="items-center">
            <Users className="h-10 w-10 mb-2 text-primary" />
            <CardTitle>Expense Sharing</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <CardDescription>
              Create groups, split expenses, and settle debts with friends and
              family.
            </CardDescription>
          </CardContent>
        </Card>
        {/* Add more cards for other features */}
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Take Control of Your Finances?
        </h2>
      </section>
    </div>
  );
}