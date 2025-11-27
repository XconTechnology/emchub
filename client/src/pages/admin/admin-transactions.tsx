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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface ServiceRequestFee {
  id: string;
  serviceRequestId: string;
  serviceOfferId: string;
  fee: number;
  status: string;
  createdAt: Date;
  userId: string;
  userName: string;
  userEmail: string;
  requestTitle: string;
  requestDescription: string;
}

export default function AdminTransactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tab, setTab] = useState("transactions");

  const { data: transactions, isLoading: txLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/admin/transactions'],
    staleTime: 5000,
    gcTime: 10000,
  });

  const { data: fees, isLoading: feesLoading } = useQuery<ServiceRequestFee[]>({
    queryKey: ['/api/admin/service-request-fees'],
    staleTime: 5000,
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

  const filteredFees = fees?.filter((fee) => {
    const matchesSearch = 
      fee.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fee.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fee.requestTitle?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || fee.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalTransactions = filteredTransactions?.length || 0;
  const totalRevenue = filteredTransactions?.reduce((sum, t) => sum + Number(t.totalAmount), 0) || 0;
  const totalCommission = filteredTransactions?.reduce((sum, t) => sum + Number(t.platformCommission), 0) || 0;

  const totalFees = filteredFees?.length || 0;
  const totalServiceFees = filteredFees?.reduce((sum, f) => sum + Number(f.fee), 0) || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
      case "completed":
        return <Badge className="bg-green-500" data-testid={`badge-status-${status}`}>Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500" data-testid={`badge-status-${status}`}>Pending</Badge>;
      case "failed":
        return <Badge variant="destructive" data-testid={`badge-status-${status}`}>Failed</Badge>;
      default:
        return <Badge variant="outline" data-testid={`badge-status-${status}`}>{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Transactions</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View all payment transactions and service request fees
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="transactions">Product Orders</TabsTrigger>
          <TabsTrigger value="fees">Service Request Fees</TabsTrigger>
        </TabsList>

        {/* PRODUCT/ORDER TRANSACTIONS TAB */}
        <TabsContent value="transactions" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-transactions">{totalTransactions}</div>
                <p className="text-xs text-muted-foreground">All-time product orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-revenue">HK${totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Total payment volume</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platform Commission (5%)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="text-total-commission">HK${totalCommission.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Your earnings from products</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>All Product Transactions</CardTitle>
              <CardDescription>
                View all product purchases and payments
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

              {txLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : filteredTransactions && filteredTransactions.length > 0 ? (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Admin (5%)</TableHead>
                        <TableHead>Vendor (95%)</TableHead>
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
                            <div>
                              <p className="font-medium text-sm">{transaction.customer?.username || "Unknown"}</p>
                              <p className="text-xs text-gray-500">{transaction.customer?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{transaction.vendor?.username || "Unknown"}</p>
                              <p className="text-xs text-gray-500">{transaction.vendor?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">HK${Number(transaction.totalAmount).toFixed(2)}</TableCell>
                          <TableCell className="text-green-600 font-medium">HK${Number(transaction.platformCommission).toFixed(2)}</TableCell>
                          <TableCell className="text-blue-600 font-medium">HK${Number(transaction.vendorEarnings).toFixed(2)}</TableCell>
                          <TableCell>{getStatusBadge(transaction.paymentStatus)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No product transactions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SERVICE REQUEST FEES TAB */}
        <TabsContent value="fees" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Service Fees</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-fees">{totalFees}</div>
                <p className="text-xs text-muted-foreground">All-time service request fees</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Service Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="text-total-service-revenue">HK${totalServiceFees.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Your earnings (100% from fees)</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Service Request Fees</CardTitle>
              <CardDescription>
                All service request fees (100% goes to admin)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by user, request title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-fees"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[200px]" data-testid="select-status-filter-fees">
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

              {feesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : filteredFees && filteredFees.length > 0 ? (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Service Request</TableHead>
                        <TableHead>Fee Amount</TableHead>
                        <TableHead>Your Earnings</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFees.map((fee) => (
                        <TableRow key={fee.id} data-testid={`row-fee-${fee.id}`}>
                          <TableCell className="text-sm">
                            {format(new Date(fee.createdAt), "MMM dd, yyyy HH:mm")}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{fee.userName || "Unknown"}</p>
                              <p className="text-xs text-gray-500">{fee.userEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="space-y-1">
                              <p className="font-medium text-sm">{fee.requestTitle}</p>
                              {fee.requestDescription && (
                                <p className="text-xs text-gray-500 truncate" title={fee.requestDescription}>
                                  {fee.requestDescription.substring(0, 50)}...
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">HK${Number(fee.fee).toFixed(2)}</TableCell>
                          <TableCell className="text-green-600 font-bold">HK${Number(fee.fee).toFixed(2)}</TableCell>
                          <TableCell>{getStatusBadge(fee.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No service request fees yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
