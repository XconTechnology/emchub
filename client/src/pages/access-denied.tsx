import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { Link } from "wouter";

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="w-16 h-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This page requires special privileges that your account doesn't have. 
            Please contact an administrator if you believe this is an error.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/">
              <Button variant="outline" data-testid="button-home">
                Go Home
              </Button>
            </Link>
            <Link href="/explore">
              <Button data-testid="button-explore">
                Explore Listings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
