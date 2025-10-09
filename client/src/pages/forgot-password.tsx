import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [resetLink, setResetLink] = useState("");
  const { toast } = useToast();

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest("POST", "/api/forgot-password", { email });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Success!",
        description: "If that email exists, a reset link has been sent",
      });
      // In development, show the reset link
      if (data.resetLink) {
        setResetLink(data.resetLink);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    forgotPasswordMutation.mutate(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" data-testid="button-back-to-login">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Button>
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!resetLink ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    data-testid="input-forgot-email"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[hsl(86,49%,53%)] hover:bg-[hsl(86,49%,48%)]"
                disabled={forgotPasswordMutation.isPending}
                data-testid="button-send-reset-link"
              >
                {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800">
                  Password reset link sent! Check your email.
                </p>
              </div>
              
              {/* Development only - show reset link */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-semibold text-yellow-800 mb-2">Development Mode:</p>
                <Link href={resetLink}>
                  <Button
                    variant="outline"
                    className="w-full"
                    data-testid="button-reset-link"
                  >
                    Go to Reset Password Page
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
