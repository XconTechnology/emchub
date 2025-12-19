import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import { format } from "date-fns";

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
    </div>
  );
}
