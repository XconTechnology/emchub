import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Gift, Calendar, Package, Info } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

type TdTransaction = {
  id: number;
  userId: number;
  type: 'earn' | 'spend';
  amount: number;
  listingId: number | null;
  orderId: number | null;
  note: string | null;
  createdAt: string;
};

export default function UserTimeDollars() {
  const { toast } = useToast();
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [tdAmountToConvert, setTdAmountToConvert] = useState("");

  // Fetch TD balance
  const { data: balanceData } = useQuery<{ balance: number }>({
    queryKey: ['/api/timedollars/balance'],
  });

  // Fetch TD transactions
  const { data: transactionsData } = useQuery<TdTransaction[]>({
    queryKey: ['/api/td/transactions'],
  });

  const balance = balanceData?.balance || 0;
  const transactions = transactionsData || [];

  // Calculate total earned and spent
  const totalEarned = transactions
    .filter(t => t.type === 'earn')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = transactions
    .filter(t => t.type === 'spend')
    .reduce((sum, t) => sum + t.amount, 0);

  // Convert TD to coupon mutation
  const convertMutation = useMutation({
    mutationFn: async (tdAmount: number) => {
      return await apiRequest('/api/td/convert-to-coupon', 'POST', { tdAmount });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Conversion Successful!",
        description: `Converted ${data.coupon.tdSpent} TD to HK$${data.coupon.cashValue} cash coupon. Code: ${data.coupon.code}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/timedollars/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/td/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/coupons/user'] });
      setConvertDialogOpen(false);
      setTdAmountToConvert("");
    },
    onError: (error: any) => {
      toast({
        title: "Conversion Failed",
        description: error.message || "Failed to convert TimeDollars",
        variant: "destructive",
      });
    },
  });

  const handleConvert = () => {
    const amount = parseFloat(tdAmountToConvert);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid TD amount to convert",
        variant: "destructive",
      });
      return;
    }
    if (amount > balance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${balance} TD available`,
        variant: "destructive",
      });
      return;
    }
    convertMutation.mutate(amount);
  };

  const cashValue = tdAmountToConvert ? (parseFloat(tdAmountToConvert) * 60).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      {/* Beta Notice */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 flex items-center gap-2">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          TimeDollars is currently in Beta phase.{" "}
          <Link href="/about-us" className="font-medium underline hover:no-underline">
            Click here to learn more
          </Link>
        </p>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
            TimeDollar Wallet
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Earn and spend TimeDollars for services within the community
          </p>
        </div>

        <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-green hover:bg-brand-green/90" data-testid="button-convert-td">
              <Gift className="w-4 h-4 mr-2" />
              Convert to Coupon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convert TD to Cash Coupon</DialogTitle>
              <DialogDescription>
                Convert your TimeDollars to cash coupons. 1 TD = HK$60
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="td-amount">TimeDollar Amount</Label>
                <Input
                  id="td-amount"
                  type="number"
                  placeholder="Enter TD amount"
                  value={tdAmountToConvert}
                  onChange={(e) => setTdAmountToConvert(e.target.value)}
                  min="0"
                  step="0.01"
                  data-testid="input-td-amount"
                />
                <p className="text-sm text-gray-500">
                  Available balance: <span className="font-semibold">{balance} TD</span>
                </p>
              </div>

              {tdAmountToConvert && parseFloat(tdAmountToConvert) > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    You will receive:
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    HK${cashValue}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Cash coupon (1 TD = HK$60)
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConvertDialogOpen(false)} data-testid="button-cancel-convert">
                Cancel
              </Button>
              <Button
                onClick={handleConvert}
                disabled={convertMutation.isPending}
                data-testid="button-confirm-convert"
              >
                {convertMutation.isPending ? "Converting..." : "Convert"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
              <span className="text-3xl font-bold" data-testid="text-balance">{balance.toFixed(2)}</span>
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
              <span className="text-3xl font-bold" data-testid="text-earned">{totalEarned.toFixed(2)}</span>
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
              <span className="text-3xl font-bold" data-testid="text-spent">{totalSpent.toFixed(2)}</span>
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
          <CardDescription>Your TimeDollar transaction activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No transactions yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Start earning TimeDollars by selling TD-eligible products or services
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  data-testid={`transaction-${transaction.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${transaction.type === 'earn' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      {transaction.type === 'earn' ? (
                        <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.type === 'earn' ? 'Earned' : 'Spent'} {transaction.amount} TD
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {transaction.note || `${transaction.type === 'earn' ? 'Earned' : 'Spent'} TimeDollars`}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">
                          {format(new Date(transaction.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge variant={transaction.type === 'earn' ? 'default' : 'destructive'} className="ml-4">
                    {transaction.type === 'earn' ? '+' : '-'}{transaction.amount} TD
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-brand-green/5 dark:bg-brand-green/10 border-brand-green/20">
        <CardHeader>
          <CardTitle>(Under Development)</CardTitle>
          <CardTitle>How TimeDollars Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <strong className="text-brand-green">• Earning TD:</strong>
            <p className="ml-4 mt-1">Sellers can gain TDs from being verified, successful application for event hosting or request TDs to distribute during events etc. 1 TD is around HK $60 Redemption Value</p>
          </div>
          <div>
            <strong className="text-brand-green">• Spending TD:</strong>
            <p className="ml-4 mt-1">Use your TD to purchase TD-eligible products and services. Look for the TD badge on listings!</p>
          </div>
          <div>
            <strong className="text-brand-green">• Community Currency:</strong>
            <p className="ml-4 mt-1">TimeDollars promote community support and economic exchange within Hong Kong's ethnic minority community.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
