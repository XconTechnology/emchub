import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, GraduationCap, Globe, Store, MapPin } from "lucide-react";

export default function Hero() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Heading */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Searching for a halal place?
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the best places to stay, eat, shop & visit the city nearest to you.
            </p>
          </div>
          
          {/* Clean Search Bar */}
          <div className="max-w-4xl mx-auto mb-12" data-testid="hero-search-container">
            <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search businesses, cuisines, services..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-base"
                    data-testid="input-search"
                  />
                </div>
                <div className="relative min-w-[200px]">
                  <Select>
                    <SelectTrigger className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" data-testid="select-category">
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
                <Button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors" data-testid="button-search">
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Simple OR Divider */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600 max-w-32"></div>
            <div className="mx-6">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-sm">OR</span>
              </div>
            </div>
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600 max-w-32"></div>
          </div>

          {/* Simple Browse by Category */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-8">Browse by category</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer" data-testid="category-school">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-center font-semibold text-foreground">School</h3>
              </div>
              
              <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer" data-testid="category-online">
                <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Globe className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-center font-semibold text-foreground">Online</h3>
              </div>
              
              <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer" data-testid="category-provision-store">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Store className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-center font-semibold text-foreground">Provision-Store</h3>
              </div>
              
              <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer" data-testid="category-masjid">
                <div className="w-16 h-16 bg-primary/10 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-center font-semibold text-foreground">Masjid</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
