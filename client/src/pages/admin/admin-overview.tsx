import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { List, FileCheck, FilePlus, Trash2, Users as UsersIcon } from "lucide-react";

interface DashboardStats {
  totalListings: number;
  publishedListings: number;
  draftListings: number;
  deletedListings: number;
  totalUsers: number;
}

export default function AdminOverview() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/stats'],
  });

  const cards = [
    {
      title: "Total Listings",
      value: stats?.totalListings ?? 0,
      icon: List,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      testId: "stat-total-listings",
    },
    {
      title: "Published Listings",
      value: stats?.publishedListings ?? 0,
      icon: FileCheck,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      testId: "stat-published-listings",
    },
    {
      title: "Draft Listings",
      value: stats?.draftListings ?? 0,
      icon: FilePlus,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      testId: "stat-draft-listings",
    },
    {
      title: "Deleted Listings",
      value: stats?.deletedListings ?? 0,
      icon: Trash2,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      testId: "stat-deleted-listings",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: UsersIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      testId: "stat-total-users",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Dashboard Overview
        </h2>
        <p className="text-muted-foreground mt-2">
          Summary of your platform's key metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="hover:shadow-lg transition-shadow" data-testid={card.testId}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${card.color}`} data-testid={`${card.testId}-value`}>
                  {card.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
