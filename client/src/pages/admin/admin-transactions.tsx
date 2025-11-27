import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { CreditCard, DollarSign, Search, TrendingUp, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  orderId: string;
  stripePaymentIntentId: string;
  customerId: string;
  vendorId: string;
  totalAmount: number;
  platformCommission: number;
  vendorEarnings: number;
  paymentStatus: string;
  createdAt: Date;
  transactionType?: string;
  serviceName?: string;
  serviceRequestTitle?: string;
  serviceRequestDescription?: string;
  estimatedHours?: number;
  offerHours?: number;
  serviceStatus?: string;
  customer?: {
    id: string;
    username: string;
    email: string;
  };
  vendor?: {
    id: string;
    username: string;
    email: string;
  };
}

export default function AdminTransactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: transactions, isLoading, refetch } = useQuery<Transaction[]>({
    queryKey: ['/api/admin/transactions'],
    staleTime: 5000, // Refresh every 5 seconds
    gcTime: 10000,
  });

  const filteredTransactions = transactions?.filter((transaction) => {
    const matchesSearch = 
      transaction.customer?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.vendor?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.vendor?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.stripePaymentIntentId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || transaction.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalTransactions = filteredTransactions?.length || 0;
  const totalRevenue = filteredTransactions?.reduce((sum, t) => sum + Number(t.totalAmount), 0) || 0;
  const totalCommission = filteredTransactions?.reduce((sum, t) => sum + Number(t.platformCommission), 0) || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
        return <Badge className="bg-green-500" data-testid={`badge-status-succeeded`}>Succeeded</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500" data-testid={`badge-status-pending`}>Pending</Badge>;
      case "failed":
        return <Badge variant="destructive" data-testid={`badge-status-failed`}>Failed</Badge>;
      default:
        return <Badge variant="outline" data-testid={`badge-status-${status}`}>{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Transactions</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage all payment transactions and commissions
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
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
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-revenue">HK${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total payment volume
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Commission (5%)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-total-commission">HK${totalCommission.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total platform earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            Search and filter through all payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by customer, vendor, or payment ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-transactions"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="succeeded">Succeeded</SelectItem>
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
                    <TableHead>Type</TableHead>
                    <TableHead>Service Details</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Admin (5%)</TableHead>
                    <TableHead>Vendor (95%)</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
                      <TableCell className="text-sm">
                        {format(new Date(transaction.createdAt), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.transactionType === 'service_offer' ? 'default' : 'outline'}>
                          {transaction.transactionType === 'service_offer' 
                            ? `💼 Service Offer` 
                            : `🛍️ Product`}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {transaction.transactionType === 'service_offer' ? (
                          <div className="space-y-1">
                            <p className="font-medium text-sm">{transaction.serviceRequestTitle || transaction.serviceName}</p>
                            {transaction.serviceRequestDescription && (
                              <p className="text-xs text-gray-500 truncate" title={transaction.serviceRequestDescription}>
                                {transaction.serviceRequestDescription.substring(0, 50)}...
                              </p>
                            )}
                            <p className="text-xs text-gray-400">
                              Fee: HK${Number(transaction.totalAmount).toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm">{transaction.serviceName}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm" data-testid={`text-vendor-${transaction.id}`}>
                            {transaction.vendor?.username || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">{transaction.vendor?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold" data-testid={`text-amount-${transaction.id}`}>
                        HK${Number(transaction.totalAmount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium" data-testid={`text-commission-${transaction.id}`}>
                        HK${Number(transaction.platformCommission).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-blue-600 font-medium" data-testid={`text-earnings-${transaction.id}`}>
                        HK${Number(transaction.vendorEarnings).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {transaction.transactionType === 'service_offer' && (
                          <div>
                            {transaction.offerHours && (
                              <p className="font-medium">{Number(transaction.offerHours).toFixed(1)}h</p>
                            )}
                            {transaction.estimatedHours && (
                              <p className="text-xs text-gray-500">Est: {Number(transaction.estimatedHours).toFixed(1)}h</p>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.paymentStatus)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400" data-testid="text-no-transactions">
                {searchQuery || statusFilter !== "all" 
                  ? "No transactions found matching your criteria" 
                  : "No transactions yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
