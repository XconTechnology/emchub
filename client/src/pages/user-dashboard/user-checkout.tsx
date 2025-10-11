import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { CheckCircle, CreditCard, Coins, AlertCircle, Wallet, DollarSign } from "lucide-react";

const checkoutSchema = z.object({
  shippingName: z.string().min(1, "Name is required"),
  shippingEmail: z.string().email("Valid email is required"),
  shippingPhone: z.string().min(1, "Phone is required"),
  shippingAddress: z.string().min(1, "Address is required"),
  shippingCity: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  paymentMethod: z.enum(["cash", "timedollar", "both"], {
    required_error: "Please select a payment method",
  }),
  cashAmount: z.number().optional(),
  tdAmount: z.number().optional(),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: string;
    imageUrl?: string;
  };
}

interface TimeDollarBalance {
  balance: number;
}

export default function UserCheckout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [comboSplitPercentage, setComboSplitPercentage] = useState(50);

  const { data: cartItems, isLoading } = useQuery<CartItem[]>({
    queryKey: ['/api/cart'],
  });

  const { data: tdBalance } = useQuery<TimeDollarBalance>({
    queryKey: ['/api/timedollars/balance'],
  });

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingName: "",
      shippingEmail: "",
      shippingPhone: "",
      shippingAddress: "",
      shippingCity: "",
      shippingPostalCode: "",
      paymentMethod: "cash",
      cashAmount: 0,
      tdAmount: 0,
      notes: "",
    },
  });

  const paymentMethod = form.watch("paymentMethod");

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      return apiRequest('POST', '/api/orders', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/timedollars/balance'] });
      setOrderCompleted(true);
      toast({
        title: "Order placed successfully!",
        description: "Your order has been confirmed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Order failed",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    },
  });

  const calculateTotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.product.price) * item.quantity);
    }, 0);
  };

  const total = calculateTotal();
  const cashAmount = paymentMethod === "cash" ? total : paymentMethod === "both" ? (total * comboSplitPercentage) / 100 : 0;
  const tdAmount = paymentMethod === "timedollar" ? total : paymentMethod === "both" ? (total * (100 - comboSplitPercentage)) / 100 : 0;
  
  const hasEnoughTD = tdBalance ? tdBalance.balance >= tdAmount : false;

  useEffect(() => {
    form.setValue("cashAmount", cashAmount);
    form.setValue("tdAmount", tdAmount);
  }, [cashAmount, tdAmount, form]);

  const onSubmit = (data: CheckoutFormData) => {
    // Validate TimeDollar balance
    if (data.paymentMethod === "timedollar" && !hasEnoughTD) {
      toast({
        title: "Insufficient TimeDollar Balance",
        description: "You don't have enough TimeDollars for this purchase.",
        variant: "destructive",
      });
      return;
    }

    if (data.paymentMethod === "both" && !hasEnoughTD) {
      toast({
        title: "Insufficient TimeDollar Balance",
        description: `You need ${tdAmount.toFixed(0)} TD but only have ${tdBalance?.balance || 0} TD.`,
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">Your cart is empty</p>
              <Button onClick={() => setLocation('/products')} data-testid="button-browse-products">
                Browse Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (orderCompleted) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2" data-testid="text-order-success">Order Placed Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Thank you for your order. We'll contact you shortly to confirm the details.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => setLocation('/dashboard/purchases')} data-testid="button-view-orders">
                  View My Purchases
                </Button>
                <Button variant="outline" onClick={() => setLocation('/products')} data-testid="button-continue-shopping">
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6" data-testid="text-checkout-title">Checkout</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Payment Method</CardTitle>
                <CardDescription>Choose how you'd like to pay for your order</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={paymentMethod} onValueChange={(value) => form.setValue("paymentMethod", value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="cash" data-testid="tab-payment-cash">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Cash
                    </TabsTrigger>
                    <TabsTrigger value="timedollar" data-testid="tab-payment-timedollar">
                      <Coins className="w-4 h-4 mr-2" />
                      TimeDollar
                    </TabsTrigger>
                    <TabsTrigger value="both" data-testid="tab-payment-both">
                      <Wallet className="w-4 h-4 mr-2" />
                      Combo
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="cash" className="mt-4">
                    <Alert>
                      <CreditCard className="w-4 h-4" />
                      <AlertDescription>
                        Pay <strong>${total.toFixed(2)}</strong> in cash. Payment will be collected upon delivery or at pickup.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>

                  <TabsContent value="timedollar" className="mt-4 space-y-3">
                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Your TimeDollar Balance</p>
                        <p className="text-2xl font-bold" data-testid="text-td-balance">{tdBalance?.balance || 0} TD</p>
                      </div>
                      <Coins className="w-8 h-8 text-[#8FC24C]" />
                    </div>
                    <Alert variant={hasEnoughTD ? "default" : "destructive"}>
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>
                        {hasEnoughTD ? (
                          <>Cost: <strong>{total.toFixed(0)} TD</strong>. You have sufficient balance!</>
                        ) : (
                          <>You need <strong>{total.toFixed(0)} TD</strong> but only have <strong>{tdBalance?.balance || 0} TD</strong>. Insufficient balance!</>
                        )}
                      </AlertDescription>
                    </Alert>
                  </TabsContent>

                  <TabsContent value="both" className="mt-4 space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Available TimeDollars</p>
                        <p className="text-xl font-bold" data-testid="text-td-balance-combo">{tdBalance?.balance || 0} TD</p>
                      </div>
                      <Coins className="w-8 h-8 text-[#8FC24C]" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Split Payment</label>
                        <span className="text-sm text-gray-600">
                          {comboSplitPercentage}% Cash / {100 - comboSplitPercentage}% TD
                        </span>
                      </div>
                      <Slider
                        value={[comboSplitPercentage]}
                        onValueChange={(value) => setComboSplitPercentage(value[0])}
                        max={100}
                        step={5}
                        className="w-full"
                        data-testid="slider-payment-split"
                      />
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="p-3 border rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Cash Amount</p>
                          <p className="text-xl font-bold" data-testid="text-cash-amount">${cashAmount.toFixed(2)}</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">TimeDollar Amount</p>
                          <p className="text-xl font-bold" data-testid="text-td-amount">{tdAmount.toFixed(0)} TD</p>
                        </div>
                      </div>
                      {!hasEnoughTD && (
                        <Alert variant="destructive">
                          <AlertCircle className="w-4 h-4" />
                          <AlertDescription>
                            Insufficient TimeDollar balance! You need {tdAmount.toFixed(0)} TD but only have {tdBalance?.balance || 0} TD.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="shippingName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} data-testid="input-shipping-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shippingEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="john@example.com" 
                              {...field} 
                              data-testid="input-shipping-email" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shippingPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="+852 1234 5678" {...field} data-testid="input-shipping-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shippingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your full address"
                              {...field}
                              data-testid="input-shipping-address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="shippingCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Hong Kong" {...field} data-testid="input-shipping-city" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="shippingPostalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="000000" {...field} data-testid="input-shipping-postal" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any special instructions?"
                              {...field}
                              data-testid="input-order-notes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-[#8FC24C] hover:bg-[#7AB03C] text-white"
                      size="lg"
                      disabled={createOrderMutation.isPending || (paymentMethod !== "cash" && !hasEnoughTD)}
                      data-testid="button-place-order"
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      {createOrderMutation.isPending ? "Processing..." : "Place Order"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.product.title} x {item.quantity}
                      </span>
                      <span>${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-[#8FC24C]" data-testid="text-checkout-total">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  
                  {paymentMethod === "cash" && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Paying with Cash
                    </div>
                  )}
                  
                  {paymentMethod === "timedollar" && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Paying with {total.toFixed(0)} TD
                    </div>
                  )}
                  
                  {paymentMethod === "both" && (
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Cash:</span>
                        <span>${cashAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">TimeDollar:</span>
                        <span>{tdAmount.toFixed(0)} TD</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
