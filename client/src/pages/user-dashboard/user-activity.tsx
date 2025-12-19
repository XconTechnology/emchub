import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, ArrowUpRight, ArrowDownLeft, Clock, Info } from "lucide-react";
import { format } from "date-fns";

// TimeDollar Constants
const TD_TO_TC = 100;        // 1 TD = 100 TimeCents
const TD_TO_HKD = 60;        // 1 TD = HK$60

interface TimeDollarTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earn' | 'spend';
  description: string;
  createdAt: string;
}

export default function UserActivity() {
  const { user } = useAuth();

  const { data: transactions, isLoading } = useQuery<TimeDollarTransaction[]>({
    queryKey: ['/api/timedollars/transactions'],
    enabled: !!user,
  });

  const { data: balanceData } = useQuery<{ balance: number }>({
    queryKey: ['/api/timedollars/balance'],
    enabled: !!user,
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Activity</h2>
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
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'earn' 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' 
                        : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                    }`}>
                      {transaction.type === 'earn' ? (
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
                        {format(new Date(transaction.createdAt), 'PPp')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-lg ${
                      transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'earn' ? '+' : '-'}{transaction.amount} TD
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews Section - Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>My Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No reviews yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Purchase products to leave reviews
            </p>
          </div>
        </CardContent>
      </Card>

      {/* How TimeDollars Work */}
      <Card className="bg-brand-green/5 dark:bg-brand-green/10 border-brand-green/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-brand-green" />
            How TimeDollars Work
          </CardTitle>
          <CardDescription>1 TD = 1 verified hour of service = {TD_TO_TC} TimeCents = HK${TD_TO_HKD}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <strong className="text-brand-green">• Earning TD:</strong>
            <p className="ml-4 mt-1">Sellers earn TimeDollars when orders are marked as "delivered" (1 TD = 1 verified hour of service).</p>
          </div>
          <div>
            <strong className="text-brand-green">• Spending TD:</strong>
            <p className="ml-4 mt-1">Use TD to purchase TD-eligible products and services. Look for the TD badge on listings!</p>
          </div>
          <div>
            <strong className="text-brand-green">• Convert to Cash:</strong>
            <p className="ml-4 mt-1">Convert TD to cash coupons: 1 TD = {TD_TO_TC} TC = HK${TD_TO_HKD}.</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
            <strong className="text-green-700 dark:text-green-400">• TD Never Expires:</strong>
            <p className="ml-4 mt-1 text-green-600 dark:text-green-300">Your TimeDollars never expire and remain in your wallet indefinitely.</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            <strong className="text-amber-700 dark:text-amber-400">• Coupons May Expire:</strong>
            <p className="ml-4 mt-1 text-amber-600 dark:text-amber-300">Cash coupons generated from TD conversions may have expiry dates. Use promptly!</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <strong className="text-blue-700 dark:text-blue-400">• Not Transferable:</strong>
            <p className="ml-4 mt-1 text-blue-600 dark:text-blue-300">TD cannot be transferred or traded between users. All TD must go through platform-verified flows.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
