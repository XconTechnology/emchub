import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export default function UserTimeDollars() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
          TimeDollars
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Earn and spend TimeDollars for services within the community
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-brand-green" />
              <span className="text-3xl font-bold" data-testid="text-balance">0</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              TimeDollars available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold" data-testid="text-earned">0</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              All time earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-8 h-8 text-red-500" />
              <span className="text-3xl font-bold" data-testid="text-spent">0</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              All time spending
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent TimeDollar transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No transactions yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Start earning TimeDollars by providing services to the community
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-brand-green/5 dark:bg-brand-green/10 border-brand-green/20">
        <CardHeader>
          <CardTitle>What are TimeDollars?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <p>
            <strong>TimeDollars</strong> are a community currency that allows you to exchange services within the ethnic minority community.
          </p>
          <p>
            • <strong>Earn</strong> TimeDollars by providing services to others
          </p>
          <p>
            • <strong>Spend</strong> TimeDollars to request services you need
          </p>
          <p>
            • 1 TimeDollar = 1 hour of service (regardless of the type of service)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
