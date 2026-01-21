import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Receipt, DollarSign, Coins, Info } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function UserPricing() {
  const { user } = useAuth();
  const [paymentType, setPaymentType] = useState("cash_only");
  const [cashPercentage, setCashPercentage] = useState(50);
  const [tdPercentage, setTdPercentage] = useState(50);

  const handleCashPercentageChange = (value: number) => {
    if (value >= 0 && value <= 100) {
      setCashPercentage(value);
      setTdPercentage(100 - value);
    }
  };

  if (user?.vendorStatus !== 'verified') {
    return (
      <div className="text-center py-12">
        <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Vendor Verification Required</h2>
        <p className="text-gray-600 mb-4">You need to be a verified vendor to access this section.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pricing Settings</h2>
        <p className="text-gray-600">Configure default payment options for your offerings</p>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Default Payment Method</CardTitle>
          <CardDescription>
            Choose how customers can pay for your products and services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={paymentType} onValueChange={setPaymentType}>
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="cash_only" id="cash_only" />
              <Label htmlFor="cash_only" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-semibold">Cash Only</div>
                    <div className="text-sm text-gray-600">Accept cash payments only</div>
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="timedollar_only" id="timedollar_only" />
              <Label htmlFor="timedollar_only" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Coins className="w-5 h-5 text-yellow-600" />
                  <div>
                    <div className="font-semibold">TimeDollar Only</div>
                    <div className="text-sm text-gray-600">Accept TimeDollars only</div>
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="both_choice" id="both_choice" />
              <Label htmlFor="both_choice" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <Coins className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Both (Customer Choice)</div>
                    <div className="text-sm text-gray-600">
                      Customer can pay with either cash or TimeDollars
                    </div>
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="combo" id="combo" />
              <Label htmlFor="combo" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-semibold">Cash + TimeDollar Combo</div>
                    <div className="text-sm text-gray-600">
                      Split payment between cash and TimeDollars
                    </div>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {paymentType === 'combo' && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base">Payment Split Configuration</CardTitle>
                <CardDescription>
                  Define the percentage split between cash and TimeDollars
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cash-percentage">Cash Percentage: {cashPercentage}%</Label>
                  <Input
                    id="cash-percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={cashPercentage}
                    onChange={(e) => handleCashPercentageChange(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="td-percentage">TimeDollar Percentage: {tdPercentage}%</Label>
                  <Input
                    id="td-percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={tdPercentage}
                    onChange={(e) => handleCashPercentageChange(100 - (parseInt(e.target.value) || 0))}
                  />
                </div>
                <div className="p-4 bg-white rounded border">
                  <p className="text-sm font-semibold mb-2">Example:</p>
                  <p className="text-sm text-gray-600">
                    For a $100 product: ${(100 * cashPercentage / 100).toFixed(2)} cash + {tdPercentage} TimeDollars
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Button className="w-full" data-testid="button-save-pricing">
            Save Pricing Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
