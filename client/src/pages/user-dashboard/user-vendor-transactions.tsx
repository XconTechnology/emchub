import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Search, TrendingUp, Loader2, Coins } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  orderId: string;
  paymentMethod: string;
  stripePaymentIntentId?: string;
  customerId: string;
  vendorId: string;
  totalAmount: string;
  cashAmount: string;
  tdAmount: string;
  platformCommission: string;
  vendorEarnings: string;
  status: string;
  description?: string;
  createdAt: string;
}

export default function UserVendorTransactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/vendor/transactions'],
  });

  const filteredTransactions = transactions?.filter((transaction) => {
    const matchesSearch = 
      transaction.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.stripePaymentIntentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    const matchesPaymentMethod = paymentMethodFilter === "all" || transaction.paymentMethod === paymentMethodFilter;

    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  const totalTransactions = filteredTransactions?.length || 0;
  const totalEarnings = filteredTransactions?.reduce((sum, t) => sum + Number(t.vendorEarnings), 0) || 0;
  const totalRevenue = filteredTransactions?.reduce((sum, t) => sum + Number(t.totalAmount), 0) || 0;
  const totalCommission = filteredTransactions?.reduce((sum, t) => sum + Number(t.platformCommission), 0) || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500" data-testid={`badge-status-completed`}>Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500" data-testid={`badge-status-pending`}>Pending</Badge>;
      case "failed":
        return <Badge variant="destructive" data-testid={`badge-status-failed`}>Failed</Badge>;
      default:
        return <Badge variant="outline" data-testid={`badge-status-${status}`}>{status}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">Cash</Badge>;
      case "timedollar":
        return <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">TimeDollar</Badge>;
      case "both":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">Cash + TD</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">My Sales & Earnings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your transactions and net earnings (95% after 5% platform commission)
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-transactions">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              All-time transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-revenue">HK${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total sales volume
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Earnings (95%)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-net-earnings">HK${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Your earnings after commission
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fee (5%)</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600" data-testid="text-platform-commission">HK${totalCommission.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total platform commission
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            View all your sales with detailed payment information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by order ID or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-transactions"
              />
            </div>
            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger className="w-full md:w-[180px]" data-testid="select-payment-method-filter">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="timedollar">TimeDollar</SelectItem>
                <SelectItem value="both">Cash + TD</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredTransactions && filteredTransactions.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Your Earnings (95%)</TableHead>
                    <TableHead className="text-right">Platform Fee (5%)</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
                      <TableCell className="font-medium">
                        {format(new Date(transaction.createdAt), "MMM dd, yyyy")}
                        <div className="text-xs text-gray-500">
                          {format(new Date(transaction.createdAt), "h:mm a")}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {transaction.orderId?.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {transaction.description || "Order"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getPaymentMethodBadge(transaction.paymentMethod)}
                          {transaction.paymentMethod === "both" && (
                            <div className="text-xs text-gray-500">
                              ${Number(transaction.cashAmount).toFixed(2)} + {Number(transaction.tdAmount).toFixed(0)} TD
                            </div>
                          )}
                          {transaction.paymentMethod === "timedollar" && (
                            <div className="text-xs text-gray-500">
                              {Number(transaction.tdAmount).toFixed(0)} TD (≈ ${(Number(transaction.tdAmount) * 60).toFixed(2)})
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        HK${Number(transaction.totalAmount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        HK${Number(transaction.vendorEarnings).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-gray-600">
                        HK${Number(transaction.platformCommission).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
