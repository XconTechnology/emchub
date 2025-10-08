import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingBag, Star, DollarSign, Briefcase } from "lucide-react";

export default function UserDashboardHome() {
  const { user } = useAuth();

  const stats = [
    {
      title: "Total Reviews",
      value: "0",
      description: "Reviews you've written",
      icon: Star,
      color: "text-yellow-500",
    },
    {
      title: "TimeDollars Balance",
      value: "0",
      description: "Available to spend",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Service Requests",
      value: "0",
      description: "Active requests",
      icon: Briefcase,
      color: "text-blue-500",
    },
    {
      title: "Purchases",
      value: "0",
      description: "Total purchases",
      icon: ShoppingBag,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
          Welcome, {user?.username}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Here's an overview of your activity
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>What would you like to do today?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <a
              href="/dashboard/browse"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              data-testid="link-browse"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">Browse Listings</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Discover businesses and services
              </p>
            </a>
            <a
              href="/dashboard/timedollars"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              data-testid="link-timedollars"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">TimeDollars</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your TimeDollars balance
              </p>
            </a>
            <a
              href="/dashboard/services"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              data-testid="link-services"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">Request Service</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Submit a service request
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
