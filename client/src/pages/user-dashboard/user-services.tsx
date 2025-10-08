import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Briefcase, Plus } from "lucide-react";
import { useState } from "react";

export default function UserServices() {
  const [showForm, setShowForm] = useState(false);

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
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service-title">Service Title</Label>
                <Input
                  id="service-title"
                  placeholder="e.g., Need help with moving furniture"
                  data-testid="input-service-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-description">Description</Label>
                <Textarea
                  id="service-description"
                  placeholder="Describe what you need help with..."
                  rows={4}
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
                    data-testid="input-service-hours"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-date">Preferred Date</Label>
                  <Input
                    id="service-date"
                    type="date"
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
                >
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-submit-request">
                  Submit Request
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
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No service requests yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Click "New Request" to submit your first service request
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
