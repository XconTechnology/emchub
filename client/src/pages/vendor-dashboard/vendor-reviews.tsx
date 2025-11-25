import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Star, Trash2, Loader2, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

interface ReviewWithDetails {
  id: string;
  userId: string;
  listingId: string;
  vendorId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    profileImageUrl: string | null;
  } | null;
  listing: {
    id: string;
    title: string;
  } | null;
}

export default function VendorReviews() {
  const { toast } = useToast();

  const { data: reviews = [], isLoading } = useQuery<ReviewWithDetails[]>({
    queryKey: ['/api/vendor/reviews'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return apiRequest('DELETE', `/api/vendor/reviews/${reviewId}`);
    },
    onSuccess: () => {
      toast({
        title: "Review deleted",
        description: "The review has been permanently removed",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/vendor/reviews'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review",
        variant: "destructive",
      });
    },
  });

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#8FC24C]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">My Reviews</h1>
        <p className="text-gray-600">Manage reviews for your products and services</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Rating</p>
                <p className="text-2xl font-bold" data-testid="text-average-rating">
                  {averageRating.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Reviews</p>
                <p className="text-2xl font-bold" data-testid="text-total-reviews">
                  {reviews.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-500 mb-2">Rating Distribution</p>
              {ratingCounts.map(({ rating, count }) => (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-3">{rating}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="w-6 text-gray-500">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No reviews yet</p>
              <p className="text-sm">Reviews from your customers will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="max-w-[300px]">Comment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id} data-testid={`review-row-${review.id}`}>
                      <TableCell>
                        {review.listing ? (
                          <Link 
                            href={`/product/${review.listing.id}`}
                            className="text-[#8FC24C] hover:underline"
                          >
                            {review.listing.title}
                          </Link>
                        ) : (
                          <span className="text-gray-400">Unknown Product</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            {review.user?.profileImageUrl ? (
                              <img 
                                src={review.user.profileImageUrl} 
                                alt={review.user.username}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-medium text-gray-500">
                                {review.user?.username?.charAt(0).toUpperCase() || '?'}
                              </span>
                            )}
                          </div>
                          <span data-testid={`review-user-${review.id}`}>
                            {review.user?.username || 'Anonymous'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="truncate" title={review.comment || ''}>
                          {review.comment || <span className="text-gray-400 italic">No comment</span>}
                        </p>
                      </TableCell>
                      <TableCell>
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              data-testid={`button-delete-review-${review.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Review</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this review? This action cannot be undone and the review will be permanently removed from the product page.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(review.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
