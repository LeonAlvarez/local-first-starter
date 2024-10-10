import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, PieChart, Users, Wallet } from "lucide-react";

type LandingPageProps = {
  onGetStarted: () => void;
};

export function Home({ onGetStarted }: LandingPageProps) {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Simplify Your Finances with SplitStream
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Track, manage, and share your expenses effortlessly.
        </p>
        <Button onClick={onGetStarted} size="lg">
          Get Started <ArrowRight className="ml-2 h-4 w-4" />
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
        <Button onClick={onGetStarted} size="lg">
          Start Tracking Now <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </section>
    </div>
  );
}

export default Home;
