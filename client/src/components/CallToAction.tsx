import { Button } from "@/components/ui/button";
import { Store, Map } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function CallToAction() {
  const { user } = useAuth();

  return (
    <section className="py-16 gradient-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
          Ready to Join Our Community?
        </h2>
        <p className="text-xl mb-8 text-[#ffffff]">
          Whether you're a business owner looking to grow or a customer seeking authentic experiences, 
          EMC HUB is your gateway to Hong Kong's vibrant ethnic minority community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={user ? "/dashboard/become-vendor" : "/auth"}>
            <Button className="bg-card text-primary px-8 py-4 rounded-xl font-semibold hover:bg-card/90 transition-colors" data-testid="button-list-business">
              <Store className="w-5 h-5 mr-2" />
              List Your Business
            </Button>
          </Link>
          <Link href="/map">
            <Button 
              variant="outline"
              className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 px-8 py-4 rounded-xl font-semibold hover:bg-primary-foreground/30 transition-colors"
              data-testid="button-explore-map"
            >
              <Map className="w-5 h-5 mr-2" />
              Explore Map
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
