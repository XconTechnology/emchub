import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { CheckCircle, CreditCard } from "lucide-react";

const checkoutSchema = z.object({
  shippingName: z.string().min(1, "Name is required"),
  shippingPhone: z.string().min(1, "Phone is required"),
  shippingAddress: z.string().min(1, "Address is required"),
  shippingCity: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  paymentMethod: z.enum(["cash", "timedollar", "both"], {
    required_error: "Please select a payment method",
  }),
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

export default function UserCheckout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [orderCompleted, setOrderCompleted] = useState(false);

  const { data: cartItems, isLoading } = useQuery<CartItem[]>({
    queryKey: ['/api/cart'],
  });

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingName: "",
      shippingPhone: "",
      shippingAddress: "",
      shippingCity: "",
      shippingPostalCode: "",
      paymentMethod: "cash",
      notes: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      return apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
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

  const onSubmit = (data: CheckoutFormData) => {
    createOrderMutation.mutate(data);
  };

  const calculateTotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.product.price) * item.quantity);
    }, 0);
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
                <Button onClick={() => setLocation('/dashboard/orders')} data-testid="button-view-orders">
                  View Orders
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6" data-testid="text-checkout-title">Checkout</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
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
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method *</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="cash" id="cash" data-testid="radio-payment-cash" />
                                <label htmlFor="cash" className="cursor-pointer">Cash</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="timedollar" id="timedollar" data-testid="radio-payment-timedollar" />
                                <label htmlFor="timedollar" className="cursor-pointer">TimeDollar</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="both" id="both" data-testid="radio-payment-both" />
                                <label htmlFor="both" className="cursor-pointer">Both (Cash + TimeDollar)</label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                      disabled={createOrderMutation.isPending}
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
                      <span className="text-gray-600">
                        {item.product.title} x {item.quantity}
                      </span>
                      <span>${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-[#8FC24C]" data-testid="text-checkout-total">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
