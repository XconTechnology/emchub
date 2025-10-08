import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function UserReviews() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
          My Reviews
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Reviews you've written for businesses and services
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Reviews</CardTitle>
          <CardDescription>All your reviews in one place</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No reviews yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Start browsing and leave reviews for businesses you visit
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
