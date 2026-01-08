import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Coins, TrendingUp, TrendingDown, RefreshCw, History, Users, Store } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface TdWallet {
  id: string;
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  username: string;
  email: string;
  role?: string;
  tdBalance?: number;
}

interface TdTransaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  notes: string;
  createdAt: string;
  username: string;
  email: string;
}

interface TdConversion {
  id: string;
  userId: string;
  tdAmount: number;
  cashAmount: number;
  couponId: string;
  createdAt: string;
  username: string;
  email: string;
}

export default function AdminTimeDollars() {
  const { toast } = useToast();
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<TdWallet | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentNotes, setAdjustmentNotes] = useState("");

  // Fetch all TD wallets
  const { data: wallets, isLoading: walletsLoading } = useQuery<TdWallet[]>({
    queryKey: ['/api/admin/td/wallets'],
  });

  // Fetch all TD transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery<TdTransaction[]>({
    queryKey: ['/api/admin/td/transactions'],
  });

  // Fetch all TD conversions
  const { data: conversions, isLoading: conversionsLoading } = useQuery<TdConversion[]>({
    queryKey: ['/api/admin/td/conversions'],
  });

  // Adjust user balance mutation
  const adjustBalanceMutation = useMutation({
    mutationFn: async ({ userId, amount, notes }: { userId: string; amount: number; notes: string }) => {
      return apiRequest('POST', '/api/admin/td/adjust-balance', {
        userId,
        amount,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/td/wallets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/td/transactions'] });
      setAdjustDialogOpen(false);
      setSelectedWallet(null);
      setAdjustmentAmount("");
      setAdjustmentNotes("");
      toast({
        title: "Balance Adjusted",
        description: "User TimeDollar balance has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to adjust balance",
        variant: "destructive",
      });
    },
  });

  const handleAdjustBalance = (wallet: TdWallet) => {
    setSelectedWallet(wallet);
    setAdjustDialogOpen(true);
  };

  const handleSubmitAdjustment = () => {
    if (!selectedWallet || !adjustmentAmount || !adjustmentNotes.trim()) {
      toast({
        title: "Error",
        description: "Please provide amount and notes for the adjustment",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(adjustmentAmount);
    if (isNaN(amount) || amount === 0) {
      toast({
        title: "Error",
        description: "Please provide a valid non-zero amount",
        variant: "destructive",
      });
      return;
    }

    adjustBalanceMutation.mutate({
      userId: selectedWallet.userId,
      amount,
      notes: adjustmentNotes,
    });
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'earn':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'spend':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'admin_adjustment':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">TimeDollar Management</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage user TimeDollar balances, view transactions, and monitor conversions
        </p>
      </div>

      <Tabs defaultValue="wallets" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wallets" data-testid="tab-td-wallets">
            <Users className="w-4 h-4 mr-2" />
            User Balances
          </TabsTrigger>
          <TabsTrigger value="vendors" data-testid="tab-td-vendors">
            <Store className="w-4 h-4 mr-2" />
            Vendor Balances
          </TabsTrigger>
          <TabsTrigger value="transactions" data-testid="tab-td-transactions">
            <History className="w-4 h-4 mr-2" />
            All Transactions
          </TabsTrigger>
          <TabsTrigger value="conversions" data-testid="tab-td-conversions">
            <RefreshCw className="w-4 h-4 mr-2" />
            Conversions to Coupons
          </TabsTrigger>
        </TabsList>

        {/* User Balances Tab */}
        <TabsContent value="wallets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User TimeDollar Balances</CardTitle>
            </CardHeader>
            <CardContent>
              {walletsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading wallets...</div>
              ) : !wallets || wallets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No wallets found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead className="text-right">Total Earned</TableHead>
                      <TableHead className="text-right">Total Spent</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wallets.map((wallet) => (
                      <TableRow key={wallet.id} data-testid={`row-wallet-${wallet.userId}`}>
                        <TableCell className="font-medium">{wallet.username}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">{wallet.email}</TableCell>
                        <TableCell className="text-right font-semibold">
                          <div className="flex items-center justify-end gap-1">
                            <Coins className="w-4 h-4 text-yellow-600" />
                            {wallet.balance} TD
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-green-600 dark:text-green-400">
                          <div className="flex items-center justify-end gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {wallet.totalEarned} TD
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-red-600 dark:text-red-400">
                          <div className="flex items-center justify-end gap-1">
                            <TrendingDown className="w-4 h-4" />
                            {wallet.totalSpent} TD
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAdjustBalance(wallet)}
                            data-testid={`button-adjust-balance-${wallet.userId}`}
                          >
                            Adjust Balance
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendor Balances Tab */}
        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendor TimeDollar Balances</CardTitle>
            </CardHeader>
            <CardContent>
              {walletsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading vendor wallets...</div>
              ) : !wallets || wallets.filter(w => w.role === 'business').length === 0 ? (
                <div className="text-center py-8 text-gray-500">No vendor wallets found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wallets
                      .filter(wallet => wallet.role === 'business')
                      .map((wallet) => (
                        <TableRow key={wallet.id} data-testid={`row-vendor-wallet-${wallet.userId}`}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Store className="w-4 h-4 text-blue-600" />
                              {wallet.username}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">{wallet.email}</TableCell>
                          <TableCell className="text-right font-semibold">
                            <div className="flex items-center justify-end gap-1">
                              <Coins className="w-4 h-4 text-yellow-600" />
                              {wallet.tdBalance ?? wallet.balance ?? 0} TD
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAdjustBalance(wallet)}
                              data-testid={`button-adjust-vendor-balance-${wallet.userId}`}
                            >
                              Add TD
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All TimeDollar Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading transactions...</div>
              ) : !transactions || transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No transactions found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(transaction.createdAt), 'PPp')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.username}</div>
                            <div className="text-xs text-gray-500">{transaction.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTransactionTypeColor(transaction.type)}>
                            {transaction.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {transaction.type === 'earn' ? '+' : '-'}{transaction.amount} TD
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {transaction.notes}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversions Tab */}
        <TabsContent value="conversions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>TimeDollar to Cash Coupon Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              {conversionsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading conversions...</div>
              ) : !conversions || conversions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No conversions found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">TD Amount</TableHead>
                      <TableHead className="text-right">Cash Value</TableHead>
                      <TableHead>Coupon ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conversions.map((conversion) => (
                      <TableRow key={conversion.id} data-testid={`row-conversion-${conversion.id}`}>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(conversion.createdAt), 'PPp')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{conversion.username}</div>
                            <div className="text-xs text-gray-500">{conversion.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-yellow-600 dark:text-yellow-400">
                          -{conversion.tdAmount} TD
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">
                          ${conversion.cashAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm font-mono text-gray-600 dark:text-gray-400">
                          {conversion.couponId.slice(0, 8)}...
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Adjust Balance Dialog */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" data-testid="dialog-adjust-balance">
          <DialogHeader>
            <DialogTitle>Adjust User TimeDollar Balance</DialogTitle>
            <DialogDescription>
              Manually adjust a user's TimeDollar balance. Use positive numbers to add TD, negative numbers to deduct TD.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedWallet && (
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p><span className="font-medium">User:</span> {selectedWallet.username}</p>
                <p><span className="font-medium">Email:</span> {selectedWallet.email}</p>
                <p><span className="font-medium">Current Balance:</span> {selectedWallet.balance} TD</p>
              </div>
            )}
            <div>
              <Label htmlFor="adjustment-amount">Adjustment Amount (TD) *</Label>
              <Input
                id="adjustment-amount"
                type="number"
                placeholder="e.g., 100 to add, -50 to deduct"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                className="mt-1"
                data-testid="input-adjustment-amount"
              />
            </div>
            <div>
              <Label htmlFor="adjustment-notes">Notes *</Label>
              <Input
                id="adjustment-notes"
                placeholder="Reason for adjustment..."
                value={adjustmentNotes}
                onChange={(e) => setAdjustmentNotes(e.target.value)}
                className="mt-1"
                data-testid="input-adjustment-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAdjustDialogOpen(false);
                setSelectedWallet(null);
                setAdjustmentAmount("");
                setAdjustmentNotes("");
              }}
              data-testid="button-cancel-adjustment"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAdjustment}
              disabled={adjustBalanceMutation.isPending || !adjustmentAmount || !adjustmentNotes.trim()}
              data-testid="button-submit-adjustment"
            >
              {adjustBalanceMutation.isPending ? "Adjusting..." : "Adjust Balance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
