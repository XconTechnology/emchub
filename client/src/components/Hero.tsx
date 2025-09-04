import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Utensils, ShoppingBag, Scissors, Bed } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-24 pb-16 hero-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Discover the Best
            <span className="text-primary block md:inline"> Ethnic Minority</span>
            <span className="block">Businesses in Hong Kong</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Find amazing places to eat, shop, and visit. Connect with the vibrant ethnic minority community and support local businesses.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto glassmorphism rounded-2xl p-2" data-testid="hero-search-container">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search businesses, cuisines, services..."
                  className="w-full pl-12 pr-4 py-4 bg-card border-border rounded-xl focus:ring-primary text-base"
                  data-testid="input-search"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none z-10" />
                <Select>
                  <SelectTrigger className="pl-12 pr-8 py-4 bg-card border-border rounded-xl focus:ring-primary min-w-[160px]" data-testid="select-location">
                    <SelectValue placeholder="All Hong Kong" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hong Kong</SelectItem>
                    <SelectItem value="central">Central</SelectItem>
                    <SelectItem value="wan-chai">Wan Chai</SelectItem>
                    <SelectItem value="causeway-bay">Causeway Bay</SelectItem>
                    <SelectItem value="tsim-sha-tsui">Tsim Sha Tsui</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors" data-testid="button-search">
                <Search className="w-5 h-5 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button
              variant="outline"
              className="bg-card px-6 py-3 rounded-full text-foreground border-border hover:border-primary hover:text-primary transition-colors"
              data-testid="category-halal-food"
            >
              <Utensils className="w-4 h-4 mr-2" />
              Halal Food
            </Button>
            <Button
              variant="outline"
              className="bg-card px-6 py-3 rounded-full text-foreground border-border hover:border-primary hover:text-primary transition-colors"
              data-testid="category-shopping"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Shopping
            </Button>
            <Button
              variant="outline"
              className="bg-card px-6 py-3 rounded-full text-foreground border-border hover:border-primary hover:text-primary transition-colors"
              data-testid="category-services"
            >
              <Scissors className="w-4 h-4 mr-2" />
              Services
            </Button>
            <Button
              variant="outline"
              className="bg-card px-6 py-3 rounded-full text-foreground border-border hover:border-primary hover:text-primary transition-colors"
              data-testid="category-accommodation"
            >
              <Bed className="w-4 h-4 mr-2" />
              Accommodation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
