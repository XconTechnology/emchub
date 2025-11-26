import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Briefcase, Plus } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function UserServices() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    estimatedHours: "",
    preferredDate: "",
  });

  const { data: requests = [] } = useQuery<any[]>({
    queryKey: ['/api/service-requests'],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => 
      apiRequest("POST", "/api/service-requests", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests'] });
      toast({ 
        title: "Service request submitted successfully",
        description: "Vendors will be able to see your request."
      });
      setFormData({ title: "", description: "", estimatedHours: "", preferredDate: "" });
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to submit request", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast({ 
        title: "Missing required fields", 
        description: "Please fill in title and description",
        variant: "destructive"
      });
      return;
    }
    submitMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
            Service Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Request services eligible for TimeDollar exchange
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          data-testid="button-new-request"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Service Request</CardTitle>
            <CardDescription>Submit a request for service using TimeDollars</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service-title">Service Title *</Label>
                <Input
                  id="service-title"
                  placeholder="e.g., Need help with moving furniture"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  data-testid="input-service-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-description">Description *</Label>
                <Textarea
                  id="service-description"
                  placeholder="Describe what you need help with..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  data-testid="textarea-service-description"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="service-hours">Estimated Hours</Label>
                  <Input
                    id="service-hours"
                    type="number"
                    placeholder="e.g., 2"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                    data-testid="input-service-hours"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-date">Preferred Date</Label>
                  <Input
                    id="service-date"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    data-testid="input-service-date"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  data-testid="button-cancel"
                  disabled={submitMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  data-testid="button-submit-request"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Service Requests</CardTitle>
          <CardDescription>All your service requests</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No service requests yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Click "New Request" to submit your first service request
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="border">
                  <CardHeader>
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{request.description}</p>
                    {request.estimatedHours && <p className="text-sm">Estimated Hours: {request.estimatedHours}</p>}
                    {request.preferredDate && <p className="text-sm">Preferred Date: {request.preferredDate}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
