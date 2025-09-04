import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, GraduationCap, Globe, Store, MapPin } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-24 pb-16 hero-gradient">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Searching for a halal place?
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Discover the best places to stay, eat, shop & visit the city nearest to you.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto glassmorphism rounded-2xl p-2 mb-8" data-testid="hero-search-container">
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
              <div className="relative min-w-[200px]">
                <Select>
                  <SelectTrigger className="px-4 py-4 bg-card border-border rounded-xl focus:ring-primary" data-testid="select-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="food">Food & Dining</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="accommodation">Accommodation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors" data-testid="button-search">
                Search
              </Button>
            </div>
          </div>

          {/* OR Divider */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex-1 h-px bg-border max-w-32"></div>
            <div className="mx-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-sm">OR</span>
              </div>
            </div>
            <div className="flex-1 h-px bg-border max-w-32"></div>
          </div>

          {/* Browse by Category */}
          <h2 className="text-lg font-semibold text-foreground mb-6">Browse by category</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-6 hover-lift cursor-pointer border border-border hover:border-primary transition-all group" data-testid="category-school">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-foreground">School</h3>
            </div>
            
            <div className="bg-card rounded-2xl p-6 hover-lift cursor-pointer border border-border hover:border-primary transition-all group" data-testid="category-online">
              <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900/30 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="font-semibold text-foreground">Online</h3>
            </div>
            
            <div className="bg-card rounded-2xl p-6 hover-lift cursor-pointer border border-border hover:border-primary transition-all group" data-testid="category-provision-store">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="font-semibold text-foreground">Provision-Store</h3>
            </div>
            
            <div className="bg-card rounded-2xl p-6 hover-lift cursor-pointer border border-border hover:border-primary transition-all group" data-testid="category-masjid">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Masjid</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
