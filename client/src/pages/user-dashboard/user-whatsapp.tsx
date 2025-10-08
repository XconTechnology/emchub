import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, ExternalLink } from "lucide-react";

export default function UserWhatsApp() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
          WhatsApp Assistance Group
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Join our community WhatsApp group for support and assistance
        </p>
      </div>

      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>EMC HUB Community Group</CardTitle>
              <CardDescription>Get help and connect with the community</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Community Support</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connect with other community members and get help when you need it
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">24/7 Assistance</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our community is active around the clock to help each other
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Stay Updated</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get the latest news and updates about EMC HUB and community events
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-green-200 dark:border-green-800">
            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              size="lg"
              data-testid="button-join-whatsapp"
              onClick={() => {
                // Replace with actual WhatsApp group link
                window.open('https://chat.whatsapp.com/invite-link', '_blank');
              }}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Join WhatsApp Group
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
              You'll be redirected to WhatsApp to join the group
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Group Guidelines</CardTitle>
          <CardDescription>Please follow these rules to maintain a helpful community</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-brand-green font-bold">•</span>
              <span>Be respectful and kind to all community members</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-green font-bold">•</span>
              <span>No spam, promotional content, or unauthorized advertisements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-green font-bold">•</span>
              <span>Keep discussions relevant to community support and assistance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-green font-bold">•</span>
              <span>Protect privacy - don't share personal information publicly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-green font-bold">•</span>
              <span>Help others when you can - we're all in this together</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
