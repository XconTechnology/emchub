import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, Calendar, User, Package } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  orderId: string;
  customerId: string;
  vendorId: string;
  paymentMethod: string;
  totalAmount: string;
  cashAmount: string;
  tdAmount: string;
  platformCommission: string;
  vendorEarnings: string;
  status: string;
  createdAt: string;
  customer: {
    id: string;
    username: string;
    email: string;
  };
  order: {
    id: string;
    totalAmount: string;
    items: Array<{
      productTitle: string;
      quantity: number;
      subtotal: string;
    }>;
  };
}

export default function UserVendorTransactions() {
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/vendor/transactions'],
  });

  // Calculate totals
  const totalSales = transactions.reduce((sum, t) => sum + parseFloat(t.totalAmount || '0'), 0);
  const totalCommission = transactions.reduce((sum, t) => sum + parseFloat(t.platformCommission || '0'), 0);
  const totalEarnings = transactions.reduce((sum, t) => sum + parseFloat(t.vendorEarnings || '0'), 0);
  const completedTransactions = transactions.filter(t => t.status === 'completed').length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      refunded: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getPaymentMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      cash: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      timedollar: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      both: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    };
    return (
      <Badge className={colors[method] || "bg-gray-100 text-gray-800"}>
        {method === 'timedollar' ? 'TimeDollar' : method.charAt(0).toUpperCase() + method.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Transactions & Earnings</h1>
        <p className="text-muted-foreground">
          View your sales history and track your earnings
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-sales">
              HK${totalSales.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {transactions.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Commission (5%)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600" data-testid="text-total-commission">
              HK${totalCommission.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Admin's share
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Net Earnings (95%)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-total-earnings">
              HK${totalEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Your share after commission
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-completed-count">
              {completedTransactions}
            </div>
            <p className="text-xs text-muted-foreground">
              Successful transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            All your sales and payment details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet. Start selling to see your earnings!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Commission (5%)</TableHead>
                    <TableHead>Your Earnings (95%)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {format(new Date(transaction.createdAt), 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{transaction.customer?.username || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">{transaction.customer?.email || ''}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <div>
                            {transaction.order?.items?.map((item, idx) => (
                              <div key={idx} className="text-sm">
                                {item.productTitle} (x{item.quantity})
                              </div>
                            )) || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPaymentMethodBadge(transaction.paymentMethod)}
                        {transaction.paymentMethod === 'both' && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Cash: HK${parseFloat(transaction.cashAmount || '0').toFixed(2)} |{' '}
                            TD: {parseFloat(transaction.tdAmount || '0').toFixed(2)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium" data-testid={`text-amount-${transaction.id}`}>
                          HK${parseFloat(transaction.totalAmount).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-orange-600" data-testid={`text-commission-${transaction.id}`}>
                          HK${parseFloat(transaction.platformCommission).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-green-600" data-testid={`text-earnings-${transaction.id}`}>
                          HK${parseFloat(transaction.vendorEarnings).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
