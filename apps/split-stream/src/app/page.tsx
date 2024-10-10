import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ArrowRight, PieChart, Users, Wallet } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">SplitStream</h1>
          <div className="flex items-center space-x-4">
            <ModeToggle />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-16 md:py-24">


        <div className="space-y-12">
          <section className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
              Simplify Your Finances with SplitStream
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Track, manage, and share your expenses effortlessly.
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </section>

          <section className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader className="items-center">
                <Wallet className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Easy Expense Tracking</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>
                  Quickly add and categorize your expenses to stay on top of your
                  spending.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="items-center">
                <PieChart className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Insightful Reports</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>
                  Visualize your spending patterns with detailed charts and
                  summaries.
                </CardDescription>
              </CardContent>
            </Card>
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
          </section>

          <section className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Take Control of Your Finances?
            </h2>
            <Button asChild size="lg">
              <Link href="/dashboard">
                Start Tracking Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </section>
        </div>
      </main>
    </div>
  );
}
