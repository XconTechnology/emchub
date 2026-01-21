import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Star,
  ShoppingBag,
  Package
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

interface TimeDollarTransaction {
  id: string;
  userId: string;
  amount: number;
  type: "earn" | "spend";
  description: string;
  createdAt: string;
}

interface Order {
  id: string;
  totalAmount: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items?: Array<{ title: string; quantity: number; price: string }>;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    images: string[] | null;
  };
  vendor: {
    id: string;
    username: string;
  };
}

export default function UserActivity() {
  const { user } = useAuth();

  const { data: transactions, isLoading } = useQuery<TimeDollarTransaction[]>({
    queryKey: ["/api/timedollars/transactions"],
    enabled: !!user
  });

  const { data: balanceData } = useQuery<{ balance: number }>({
    queryKey: ["/api/timedollars/balance"],
    enabled: !!user
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews/user"],
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          My Activity
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track your TimeDollar transactions and activity history
        </p>
      </div>

      {/* TimeDollar Balance Card */}
      <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            TimeDollar Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold" data-testid="text-timedollar-balance">
            {balanceData?.balance || 0} TD
          </p>
          <p className="text-yellow-100 mt-2">Available to spend</p>

          {/* ✅ ADDED LINE + LINK */}
          <p className="text-yellow-100/90 text-sm mt-2">
            * TimeDollars is currently in Beta phase{" "}
            <Link href="/about-us">
              <span className="underline font-semibold cursor-pointer hover:text-white">
                Click here to learn more
              </span>
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {!transactions || transactions.length === 0 ? (
            <div className="py-8 text-center">
              <Clock className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  data-testid={`transaction-${transaction.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.type === "earn"
                          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
                      }`}
                    >
                      {transaction.type === "earn" ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(transaction.createdAt), "PPp")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold text-lg ${
                        transaction.type === "earn" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.type === "earn" ? "+" : "-"}
                      {transaction.amount} TD
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Order History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Browse products to make your first purchase
              </p>
              <Link href="/products">
                <button className="mt-3 text-primary hover:underline text-sm">
                  Browse Products →
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  data-testid={`order-${order.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Order #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(order.createdAt), "PPp")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">
                      HK${order.totalAmount}
                    </p>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "shipped"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {orders.length > 5 && (
                <Link href="/dashboard/purchases">
                  <button className="w-full text-center text-primary hover:underline text-sm py-2">
                    View all {orders.length} orders →
                  </button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            My Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviewsLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          ) : !reviews || reviews.length === 0 ? (
            <div className="py-8 text-center">
              <Star className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No reviews yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Purchase products to leave reviews
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                  data-testid={`review-${review.id}`}
                >
                  <div className="flex items-start gap-4">
                    {review.listing?.images?.[0] && (
                      <img
                        src={review.listing.images[0]}
                        alt={review.listing.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Link href={`/product/${review.listing?.id}`}>
                          <h4 className="font-medium text-gray-900 dark:text-white hover:text-primary cursor-pointer">
                            {review.listing?.title || "Product"}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Sold by @{review.vendor?.username || "Vendor"}
                      </p>
                      {review.comment && (
                        <p className="text-gray-700 dark:text-gray-300 mt-2">
                          {review.comment}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {format(new Date(review.createdAt), "PPp")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
