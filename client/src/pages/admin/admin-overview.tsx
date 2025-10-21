import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { 
  List, 
  FileCheck, 
  FilePlus, 
  Trash2, 
  Users as UsersIcon,
  TrendingUp,
  DollarSign,
  Coins,
  UserPlus,
  ShoppingBag,
  Ticket,
  Clock,
  Calendar,
  CalendarDays
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface DashboardStats {
  totalListings: number;
  publishedListings: number;
  draftListings: number;
  deletedListings: number;
  totalUsers: number;
  activeUsersDaily: number;
  activeUsersWeekly: number;
  activeUsersMonthly: number;
  totalSales: string;
  commission: string;
  timeBankTotal: string;
  recentSignups: Array<{ id: string; username: string; email: string; role: string; createdAt: Date | null }>;
  recentOrders: Array<{
    id: string;
    userId: string;
    username: string;
    totalAmount: string;
    cashAmount: string;
    tdAmount: string;
    status: string;
    createdAt: Date;
  }>;
  recentCouponRedemptions: Array<{
    id: string;
    userId: string;
    username: string;
    couponCode: string;
    couponCashDiscount: string;
    couponTdDiscount: string;
    totalAmount: string;
    createdAt: Date;
  }>;
}

export default function AdminOverview() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/stats'],
  });

  const metricCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: UsersIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      testId: "stat-total-users",
    },
    {
      title: "Active Today",
      value: stats?.activeUsersDaily ?? 0,
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      testId: "stat-active-users-daily",
    },
    {
      title: "Active This Week",
      value: stats?.activeUsersWeekly ?? 0,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      testId: "stat-active-users-weekly",
    },
    {
      title: "Active This Month",
      value: stats?.activeUsersMonthly ?? 0,
      icon: CalendarDays,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
      testId: "stat-active-users-monthly",
    },
    {
      title: "Total Sales",
      value: `HK$${parseFloat(stats?.totalSales || '0').toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
      testId: "stat-total-sales",
    },
    {
      title: "Platform Commission (5%)",
      value: `HK$${parseFloat(stats?.commission || '0').toLocaleString()}`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      testId: "stat-commission",
    },
    {
      title: "TimeBank Total",
      value: `${stats?.timeBankTotal ?? 0} TD`,
      icon: Coins,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
      testId: "stat-timebank-total",
    },
  ];

  const listingCards = [
    {
      title: "Total Listings",
      value: stats?.totalListings ?? 0,
      icon: List,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      testId: "stat-total-listings",
    },
    {
      title: "Published",
      value: stats?.publishedListings ?? 0,
      icon: FileCheck,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      testId: "stat-published-listings",
    },
    {
      title: "Draft",
      value: stats?.draftListings ?? 0,
      icon: FilePlus,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      testId: "stat-draft-listings",
    },
    {
      title: "Deleted",
      value: stats?.deletedListings ?? 0,
      icon: Trash2,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      testId: "stat-deleted-listings",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
          Real-time metrics and activity from your platform
        </p>
      </div>

      {/* Business Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Business Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {metricCards.map((card) => {
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
                  <div className={`text-2xl font-bold ${card.color}`} data-testid={`${card.testId}-value`}>
                    {card.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Listing Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Listing Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {listingCards.map((card) => {
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Signups */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-purple-600" />
              <CardTitle>Recent Signups</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3" data-testid="recent-signups">
              {stats?.recentSignups && stats.recentSignups.length > 0 ? (
                stats.recentSignups.map((user) => (
                  <div key={user.id} className="flex items-start justify-between border-b pb-2 last:border-0" data-testid={`signup-${user.id}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" data-testid={`signup-username-${user.id}`}>{user.username}</p>
                      <p className="text-xs text-muted-foreground truncate" data-testid={`signup-email-${user.id}`}>{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs" data-testid={`signup-role-${user.id}`}>
                          {user.role}
                        </Badge>
                        {user.createdAt && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent signups</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-emerald-600" />
              <CardTitle>Recent Orders</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3" data-testid="recent-orders">
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-start justify-between border-b pb-2 last:border-0" data-testid={`order-${order.id}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" data-testid={`order-username-${order.id}`}>{order.username}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs font-semibold text-emerald-600" data-testid={`order-total-${order.id}`}>
                          HK${parseFloat(order.totalAmount).toFixed(2)}
                        </span>
                        {parseFloat(order.cashAmount) > 0 && (
                          <span className="text-xs text-muted-foreground">
                            (Cash: HK${parseFloat(order.cashAmount).toFixed(2)})
                          </span>
                        )}
                        {parseFloat(order.tdAmount) > 0 && (
                          <span className="text-xs text-muted-foreground">
                            (TD: {parseFloat(order.tdAmount).toFixed(2)})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={order.status === 'delivered' ? 'default' : 'secondary'} 
                          className="text-xs"
                          data-testid={`order-status-${order.id}`}
                        >
                          {order.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent orders</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Coupon Redemptions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-orange-600" />
              <CardTitle>Coupon Redemptions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3" data-testid="recent-coupon-redemptions">
              {stats?.recentCouponRedemptions && stats.recentCouponRedemptions.length > 0 ? (
                stats.recentCouponRedemptions.map((redemption) => (
                  <div key={redemption.id} className="flex items-start justify-between border-b pb-2 last:border-0" data-testid={`redemption-${redemption.id}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" data-testid={`redemption-username-${redemption.id}`}>{redemption.username}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs font-mono" data-testid={`redemption-code-${redemption.id}`}>
                          {redemption.couponCode}
                        </Badge>
                        {parseFloat(redemption.couponCashDiscount) > 0 && (
                          <span className="text-xs text-emerald-600 font-semibold">
                            -HK${parseFloat(redemption.couponCashDiscount).toFixed(2)}
                          </span>
                        )}
                        {parseFloat(redemption.couponTdDiscount) > 0 && (
                          <span className="text-xs text-cyan-600 font-semibold">
                            -{parseFloat(redemption.couponTdDiscount).toFixed(2)} TD
                          </span>
                        )}
                      </div>
                      <div className="mt-1">
                        <span className="text-xs text-muted-foreground">
                          Order: HK${parseFloat(redemption.totalAmount).toFixed(2)} • {formatDistanceToNow(new Date(redemption.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent coupon redemptions</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
