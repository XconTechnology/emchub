import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  Coins,
  Activity,
  ShoppingBag,
  Ticket
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AnalyticsData {
  userGrowth: Array<{ date: string; count: number }>;
  topUsersByActivity: Array<{ id: string; username: string; email: string; activityCount: number }>;
  topUsersBySpend: Array<{ id: string; username: string; email: string; totalSpent: string }>;
  salesVolume: string;
  averageOrderValue: string;
  topCategories: Array<{ category: string; count: number; revenue: string }>;
  topProducts: Array<{ id: string; title: string; orderCount: number; revenue: string }>;
  tdEarned: string;
  tdSpent: string;
  topTdContributors: Array<{ id: string; username: string; balance: number }>;
  couponRedemptionRate: string;
}

export default function AdminAnalytics() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/admin/analytics'],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Total Sales Volume",
      value: `HK$${parseFloat(analytics?.salesVolume || '0').toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
      testId: "analytics-sales-volume",
    },
    {
      title: "Avg Order Value",
      value: `HK$${parseFloat(analytics?.averageOrderValue || '0').toLocaleString()}`,
      icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      testId: "analytics-avg-order",
    },
    {
      title: "TD Earned",
      value: `${analytics?.tdEarned || 0} TD`,
      icon: Coins,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
      testId: "analytics-td-earned",
    },
    {
      title: "Coupon Redemption Rate",
      value: `${analytics?.couponRedemptionRate || 0}%`,
      icon: Ticket,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      testId: "analytics-coupon-rate",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Platform Analytics
        </h2>
        <p className="text-muted-foreground mt-2">
          In-depth insights into your platform's performance and user behavior
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
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

      {/* User Growth Chart */}
      <Card data-testid="user-growth-chart">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <CardTitle>User Growth (Last 30 Days)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {analytics?.userGrowth && analytics.userGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="New Users"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">No user growth data available</p>
          )}
        </CardContent>
      </Card>

      {/* User Analytics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users by Activity */}
        <Card data-testid="top-users-activity">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <CardTitle>Top Users by Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Activities</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics?.topUsersByActivity && analytics.topUsersByActivity.length > 0 ? (
                    analytics.topUsersByActivity.map((user) => (
                      <TableRow key={user.id} data-testid={`activity-user-${user.id}`}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                        <TableCell className="text-right font-semibold">{user.activityCount}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No activity data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Top Users by Spend */}
        <Card data-testid="top-users-spend">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              <CardTitle>Top Users by Spend</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics?.topUsersBySpend && analytics.topUsersBySpend.length > 0 ? (
                    analytics.topUsersBySpend.map((user) => (
                      <TableRow key={user.id} data-testid={`spend-user-${user.id}`}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                        <TableCell className="text-right font-semibold text-emerald-600">
                          HK${parseFloat(user.totalSpent).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No spending data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card data-testid="top-categories">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-600" />
              <CardTitle>Top Categories by Revenue</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {analytics?.topCategories && analytics.topCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topCategories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#6366f1" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No category data available</p>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card data-testid="top-products">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
              <CardTitle>Top Products by Revenue</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                    analytics.topProducts.map((product) => (
                      <TableRow key={product.id} data-testid={`product-${product.id}`}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {product.title}
                        </TableCell>
                        <TableCell className="text-right">{product.orderCount}</TableCell>
                        <TableCell className="text-right font-semibold text-emerald-600">
                          HK${parseFloat(product.revenue).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No product data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TimeBank Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TD Stats */}
        <Card data-testid="td-stats">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-cyan-600" />
              <CardTitle>TimeBank Statistics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total TD Earned</p>
                  <p className="text-2xl font-bold text-cyan-600">{analytics?.tdEarned || 0} TD</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total TD Spent</p>
                  <p className="text-2xl font-bold text-orange-600">{analytics?.tdSpent || 0} TD</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Net TD Balance</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(parseFloat(analytics?.tdEarned || '0') - parseFloat(analytics?.tdSpent || '0')).toFixed(2)} TD
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top TD Contributors */}
        <Card data-testid="top-td-contributors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <CardTitle>Top TimeBank Contributors</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead className="text-right">TD Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics?.topTdContributors && analytics.topTdContributors.length > 0 ? (
                    analytics.topTdContributors.map((user) => (
                      <TableRow key={user.id} data-testid={`td-contributor-${user.id}`}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell className="text-right font-semibold text-cyan-600">
                          {user.balance} TD
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No TimeBank data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
